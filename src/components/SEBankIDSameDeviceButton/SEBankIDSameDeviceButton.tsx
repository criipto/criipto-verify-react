import { PKCE, AuthorizeResponse } from '@criipto/auth-js';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import CriiptoVerifyContext from '../../context';
import { getMobileOS } from '../../device';

import Desktop from './Desktop';
import Android from './Android';
import IOS from './iOS';

import {autoHydratedState, Links} from './shared';

interface Props {
  className: string
  children: React.ReactNode
  logo: React.ReactNode
  href?: string
  redirectUri?: string
}

const mobileOS = getMobileOS();

function searchParamsToPOJO(input: URLSearchParams) {
  return Array.from(input.keys()).reduce((memo : {[key: string]: string}, key) => {
    memo[key] = input.get(key)!;
    return memo;
  }, {});
}

export default function SEBankIDSameDeviceButton(props: Props) {
  const [href, setHref] = useState(props.href);
  const [links, setLinks] = useState<Links | null>(autoHydratedState?.links ?? null);
  const [pkce, setPKCE] = useState<PKCE | undefined>(autoHydratedState?.pkce ?? undefined);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<(string | string[])[]>([]);
  const [initiated, setInitiated] = useState(autoHydratedState ? true : false);
  const {buildAuthorizeUrl, completionStrategy, generatePKCE, handleResponse, redirectUri: defaultRedirectURi} = useContext(CriiptoVerifyContext);
  const redirectUri = props.redirectUri || defaultRedirectURi;

  const reset = () => {
    setPKCE(undefined);
    setLinks(null);
    setHref(props.href);
  };

  const handleLog = (...statements: string[]) => {
    console.log(statements);
    setLog(logs => logs.concat([statements]));
  }

  const handleComplete = useCallback(async (completeUrl: string) => {
    const required = {pkce};
    reset();

    const completeResponse = await fetch(completeUrl);
    if (completeResponse.status >= 400) {
      setError(await completeResponse.text());
      return;
    }
    
    const {location}  : {location: string} = await completeResponse.json();
    if (completionStrategy === 'openidprovider') {
      window.location.href = location;
      return;
    }
    const url = new URL(location);
    const params = searchParamsToPOJO(url.searchParams) as AuthorizeResponse;

    await handleResponse(params, {
      pkce: required.pkce,
      redirectUri
    });
  }, [completionStrategy, pkce]);

  const refresh = useCallback(async () => {
    handleLog('SEBankID: Refresh authorize url');
    const pkce = await generatePKCE();

    buildAuthorizeUrl({
      acrValues: 'urn:grn:authn:se:bankid:same-device',
      loginHint: 'appswitch:browser',
      responseMode: 'json',
      pkce,
      redirectUri
    }).then(url => {
      return fetch(url).then(response => response.json() as Promise<Links>);
    })
    .then(links => {
      setPKCE(pkce || undefined);
      setLinks(links);
      const redirect = mobileOS === 'ios' ? encodeURIComponent(window.location.href) : 'null';
      const newHref = `${mobileOS ? links.launchLinks.universalLink : links.launchLinks.customFileHandlerUrl}&redirect=${redirect}`;

      handleLog(window.location.href);
      handleLog(newHref);
      setHref(newHref);
    })
    .catch(console.error);
  }, [buildAuthorizeUrl, redirectUri]);

  // Generate URL on first button render
  useEffect(() => {
    if (initiated) return;
    refresh();
  }, [refresh, initiated]);

  // Continously fetch new autostart token if UI is open for a long time
  useEffect(() => {
    if (initiated) return;

    const interval = setInterval(() => {
      if (initiated) return;
      refresh();
    }, 25000);
    return () => clearInterval(interval);
  }, [refresh, initiated]);

  // Track when the button is clicked to stop refreshing URL
  const handleInitiate = () => {
    handleLog('Initiated');
    setInitiated(true);
    setError(null);
  }

  const handleError = (error: string) => {
    setInitiated(false);
    setError(error);
  }

  const element = (
    <a className={`${props.className} ${initiated ? 'criipto-eid-btn--disabled' : ''}`} href={href} onClick={handleInitiate}>
      <div className="criipto-eid-logo">
        {initiated ? <div className="criipto-eid-loader"></div> : props.logo}
      </div>
      {props.children}
    </a>
  );

  return (
    <React.Fragment>
      {links ? (
        <React.Fragment>
          {mobileOS === null ? (
            <Desktop
              links={links}
              onError={handleError}
              onComplete={handleComplete}
              onInitiate={handleInitiate}
              onLog={handleLog}
            >
              {element}
            </Desktop>
          ) : mobileOS === 'android' ? (
            <Android
              links={links}
              onError={handleError}
              onComplete={handleComplete}
              onInitiate={handleInitiate}
              onLog={handleLog}
            >
              {element}
            </Android>
          ) : mobileOS === 'ios' ? (
            <IOS
              links={links}
              onError={handleError}
              onComplete={handleComplete}
              onInitiate={handleInitiate}
              onLog={handleLog}
              redirectUri={redirectUri!}
              pkce={pkce}
            >
              {element}
            </IOS>
          ) : element}
        </React.Fragment>
      ) : element}
      {error && <p>{error}</p>}
      {/* {log && (
        <pre>
          {JSON.stringify(log, null, 2)}
        </pre>
      )} */}
    </React.Fragment>
  )
}