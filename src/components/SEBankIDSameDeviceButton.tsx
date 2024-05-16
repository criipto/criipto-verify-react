import { PKCE, AuthorizeResponse } from '@criipto/auth-js';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import CriiptoVerifyContext from '../context';
import { getUserAgent } from '../device';

import PollStrategy from './SEBankIDSameDeviceButton/Poll';
import ForegroundStrategy from './SEBankIDSameDeviceButton/Foreground';
import ReloadStrategy from './SEBankIDSameDeviceButton/Reload';

import {autoHydratedState, Links} from './SEBankIDSameDeviceButton/shared';

interface Props {
  className: string
  children: React.ReactNode
  logo: React.ReactNode
  fallback: JSX.Element
  redirectUri?: string
  userAgent?: string
}

function searchParamsToPOJO(input: URLSearchParams) {
  return Array.from(input.keys()).reduce((memo : {[key: string]: string}, key) => {
    memo[key] = input.get(key)!;
    return memo;
  }, {});
}

export function determineStrategy(input: string | undefined) {
  const userAgent = getUserAgent(input);
  const mobileOS = userAgent?.os.name === 'iOS' ? 'iOS' : userAgent?.os.name === 'Android' ? 'android' : null;
  const iOSSafari = mobileOS === 'iOS' && userAgent?.browser.name?.includes('Safari') ? true : false;
  const strategy =
    mobileOS ?
      iOSSafari ? 'Reload' : 'Foreground'
      : 'Poll';

  return strategy;
}

export class NotDoneError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotDoneError";
  }
}

async function fetchComplete(completeUrl: string) {
  const completeResponse = await fetch(completeUrl);
  if (completeResponse.status >= 400) {
    const errorMessage = await completeResponse.text();
    const notDone = errorMessage.includes("Native-app driven authentication is not done");
    if (notDone) return new NotDoneError(errorMessage);
    return new Error(errorMessage);
  }
  
  const {location}  : {location: string} = await completeResponse.json();
  return {location};
}
export default function SEBankIDSameDeviceButton(props: Props) {
  const userAgent = getUserAgent(typeof navigator !== 'undefined' ? navigator.userAgent : props.userAgent);
  const mobileOS = userAgent?.os.name === 'iOS' ? 'iOS' : userAgent?.os.name === 'Android' ? 'android' : null;
  const iOSSafari = mobileOS === 'iOS' && userAgent?.browser.name?.includes('Safari') ? true : false;

  const strategy = determineStrategy(typeof navigator !== 'undefined' ? navigator.userAgent : props.userAgent);

  const [href, setHref] = useState<null | string>();
  const [links, setLinks] = useState<Links | null>(autoHydratedState?.links ?? null);
  const [pkce, setPKCE] = useState<PKCE | undefined>(autoHydratedState?.pkce ?? undefined);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<(string | string[])[]>([]);
  const [initiated, setInitiated] = useState(autoHydratedState ? true : false);
  const {buildAuthorizeUrl, completionStrategy, generatePKCE, handleResponse, redirectUri: defaultRedirectURi, domain} = useContext(CriiptoVerifyContext);
  const redirectUri = props.redirectUri || defaultRedirectURi;

  const reset = () => {
    setPKCE(undefined);
    setLinks(null);
  };

  const handleLog = (...statements: string[]) => {
    setLog(logs => logs.concat([statements]));
  }

  const handleComplete = useCallback(async (completeUrl: string) => {
    const required = {pkce};
    reset();

    const result = completeUrl.startsWith(`https://${domain}`) || completeUrl.startsWith(`http://${domain}`) ? await fetchComplete(completeUrl) : {
      location: completeUrl
    }
    if (result instanceof NotDoneError && strategy === 'Reload') {
      await handleResponse({
        error: 'access_denied'
      }, {
        pkce: required.pkce,
        redirectUri,
        source: 'SEBankIDSameDeviceButton'
      });
      return;
    }
    if (result instanceof Error) {
      setError(result.message);
      return;
    }
    const {location} = result;
    if (completionStrategy === 'openidprovider') {
      window.location.href = location;
      return;
    }
    const url = new URL(location);
    const params = searchParamsToPOJO(url.searchParams) as AuthorizeResponse;

    await handleResponse(params, {
      pkce: required.pkce,
      redirectUri,
      source: 'SEBankIDSameDeviceButton'
    });
  }, [completionStrategy, pkce, domain, strategy]);

  const refresh = useCallback(async () => {
    handleLog('SEBankID: Refresh authorize url');
    const pkce = await generatePKCE();

    buildAuthorizeUrl({
      acrValues: 'urn:grn:authn:se:bankid:same-device',
      loginHint: 'appswitch:browser',
      responseMode: 'json',
      pkce,
      redirectUri,
      prompt: 'login' // Triggering SSO at this point would be a mistake
    }).then(url => {
      return fetch(url).then(response => response.json() as Promise<Links>);
    })
    .then(links => {
      setPKCE(pkce || undefined);
      setLinks(links);

      const androidChrome = mobileOS === 'android' && userAgent?.browser.name === 'Chrome' ? true : false;
      const redirect = iOSSafari ? window.location.href : 'null';
      const useUniveralLink = iOSSafari || androidChrome;
      const newUrl = new URL(useUniveralLink ? links.launchLinks.universalLink : links.launchLinks.customFileHandlerUrl);
      newUrl.searchParams.set('redirect', redirect);
      const newHref = newUrl.href;

      handleLog(window.location.href);
      handleLog(newHref);
      setHref(newHref);
    })
    .catch(err => {
      setInitiated(false);
      setError(err?.toString());
    });
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

  const handleError = async (error: string) => {
    setInitiated(false);
    setError(error);

    if (error === 'access_denied' || error === '"access_denied"') {
      await handleResponse({
        error: 'access_denied'
      }, {
        pkce,
        redirectUri,
        source: 'SEBankIDSameDeviceButton'
      });
    }
  }

  const element = href ? (
    <a className={`${props.className} ${initiated ? 'criipto-eid-btn--disabled' : ''}`} href={href} onClick={handleInitiate}>
      {initiated ? (
        <div className="criipto-eid-logo">
          <div className="criipto-eid-loader"></div>
        </div>
      ) : props.logo}
      {props.children}
    </a>
  ) : props.fallback;

  return (
    <React.Fragment>
      {links ? (
        <React.Fragment>
          {strategy === "Poll" ? (
            <PollStrategy
              links={links}
              onError={handleError}
              onComplete={handleComplete}
              onInitiate={handleInitiate}
              onLog={handleLog}
            >
              {element}
            </PollStrategy>
          ) : strategy === 'Foreground' ? (
            <ForegroundStrategy
              links={links}
              onError={handleError}
              onComplete={handleComplete}
              onInitiate={handleInitiate}
              onLog={handleLog}
            >
              {element}
            </ForegroundStrategy>
          ) : strategy === 'Reload' ? (
            <ReloadStrategy
              links={links}
              onError={handleError}
              onComplete={handleComplete}
              onInitiate={handleInitiate}
              onLog={handleLog}
              redirectUri={redirectUri!}
              pkce={pkce}
            >
              {element}
            </ReloadStrategy>
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