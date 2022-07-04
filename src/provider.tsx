import React, {useMemo, useState} from 'react';
import CriiptoAuth, {AuthorizeUrlParamsOptional, PKCEPublicPart} from '@criipto/auth-js';
import { Prompt } from '@criipto/auth-js/dist/types';

import CriiptoVerifyContext, {CriiptoVerifyContextInterface} from './context';

export interface CriiptoVerifyProviderOptions {
  domain: string
  clientID: string
  redirectUri?: string
  children: React.ReactNode
  pkce?: PKCEPublicPart
  state?: string
  prompt?: Prompt
}

const CriiptoVerifyProvider = (props: CriiptoVerifyProviderOptions) : JSX.Element => {
  const [client] = useState(
    () => new CriiptoAuth({
      domain: props.domain,
      clientID: props.clientID,
      store: sessionStorage,
      redirectUri: props.redirectUri
    })
  );

  const context = useMemo<CriiptoVerifyContextInterface>(() => {
    return {
      loginWithRedirect: () => client.redirect.authorize({
        redirectUri: window.location.origin
      }),
      fetchOpenIDConfiguration: () => client.fetchOpenIDConfiguration(),
      buildAuthorizeUrl: async (options?: AuthorizeUrlParamsOptional) => {
        return await client.buildAuthorizeUrl(client.buildAuthorizeParams({
          pkce: props.pkce,
          state: props.state,
          prompt: props.prompt,
          ...options || {},
        }));
      }
    }
  }, [
    client,
    props.redirectUri
  ]);

  return (
    <CriiptoVerifyContext.Provider value={context}>
      {props.children}
    </CriiptoVerifyContext.Provider>
  );
}

export default CriiptoVerifyProvider