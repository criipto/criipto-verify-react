import { PKCE, AuthorizeResponse } from '@criipto/auth-js';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import CriiptoVerifyContext from '../../context';
import { getMobileOS } from '../../device';
import usePageVisibility from '../../hooks/usePageVisibility';

interface Props {
  className: string
  children: React.ReactNode
  href?: string
  redirectUri?: string
}

interface Links {
  cancelUrl: string
  completeUrl: string
  pollUrl: string
  launchLinks: {
    customFileHandlerUrl: string
    universalLink: string
  }
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
  const [links, setLinks] = useState<Links | null>(null);
  const [pkce, setPKCE] = useState<PKCE | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [initiated, setInitiated] = useState(false);
  const {buildAuthorizeUrl, completionStrategy, generatePKCE, domain, handleResponse} = useContext(CriiptoVerifyContext);
  const {redirectUri} = props;

  const reset = () => {
    setPKCE(undefined);
    setLinks(null);
    setHref(props.href);
  };

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
      redirectUri: redirectUri
    })
  }, [completionStrategy, pkce]);

  // Mobile visibility scenario
  usePageVisibility(async () => {
    if (!links || !mobileOS) return;

    handleComplete(links.completeUrl);
  }, [links]);

  // Desktop polling scenario
  useEffect(() => {
    if (!links) return;
    if (mobileOS) return;
    if (!initiated) return;
    
    let timeout : string | undefined;
    const poll = async () => {
      const response = await fetch(links.pollUrl);

      if (response.status === 202) {
        setTimeout(poll, 1000);
        return;
      } else if (response.status >= 400) {
        const error = await response.text();
        setError(error);
        return;
      } else {
        const {targetUrl} = await response.json();
        await handleComplete(`https://${domain}${targetUrl}`);
        return;
      }
    };

    setTimeout(poll, 1000);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [links, initiated]);

  const refresh = useCallback(async () => {
    console.log('SEBankID: Refresh authorize url');
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
      setHref(`${mobileOS ? links.launchLinks.universalLink : links.launchLinks.customFileHandlerUrl}&redirect=${redirect}`);
    })
    .catch(console.error);
  }, [buildAuthorizeUrl, redirectUri]);

  // Generate URL on first button render
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Continously fetch new autostart token if UI is open for a long time
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (initiated) return;
  //     refresh();
  //   }, 25000);
  //   return () => clearInterval(interval);
  // }, [refresh, initiated]);

  // Track when the button is clicked to stop refreshing URL
  const handleClick = () => {
    setInitiated(true);
    setError(null);
  }

  return (
    <React.Fragment>
      <a className={`criipto-verify-button ${props.className}`} href={href} onClick={handleClick}>
        {props.children}
      </a>
      {error && <p>{error}</p>}
    </React.Fragment>
  )
}