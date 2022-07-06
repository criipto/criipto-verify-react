import { generatePKCE } from '@criipto/auth-js';
import React, {useContext, useEffect, useState} from 'react';
import CriiptoVerifyContext from '../../context';
import { getMobileOS } from '../../device';
import usePageVisibility from '../../hooks/usePageVisibility';

interface Props {
  className: string
  children: React.ReactNode
  href?: string
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
  return Array.from(input.keys())
}

export default function SEBankIDSameDeviceButton(props: Props) {
  const [href, setHref] = useState(props.href);
  const [links, setLinks] = useState<Links | null>(null);
  const {buildAuthorizeUrl} = useContext(CriiptoVerifyContext);

  usePageVisibility(async () => {
    if (!links || mobileOS) return;
    console.log(links);

    const completeResponse : {location: string} = await fetch(links!.completeUrl).then(response => {
      return response.json();
    });

    console.log(completeResponse);
    const url = new URL(completeResponse.location);
    
  });

  // Desktop polling scenario
  useEffect(() => {
    if (!links || mobileOS) return;
    
  }, [links]);

  useEffect(() => {
    buildAuthorizeUrl({
      acrValues: 'urn:grn:authn:se:bankid:same-device',
      loginHint: 'appswitch:browser',
      responseMode: 'json'
    }).then(url => {
      console.log(url);

      return fetch(url).then(response => response.json() as Promise<Links>);
    })
    .then(links => {
      setLinks(links);
      setHref(`${mobileOS ? links.launchLinks.universalLink : links.launchLinks.customFileHandlerUrl}&redirect=null`);
    })
    .catch(console.error)
  }, []);

  return (
    <a className={`criipto-verify-button ${props.className}`} href={href}>
      {props.children}
    </a>
  )
}