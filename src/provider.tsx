import React, {useMemo, useState} from 'react';
import CriiptoAuth, {AuthorizeUrlParamsOptional, generatePKCE, OAuth2Error, PKCEPublicPart, Prompt} from '@criipto/auth-js';

import CriiptoVerifyContext, {CriiptoVerifyContextInterface, Action, Result} from './context';
 
export interface CriiptoVerifyProviderOptions {
  domain: string
  clientID: string
  redirectUri?: string
  children: React.ReactNode
  pkce?: PKCEPublicPart
  state?: string
  prompt?: Prompt
  /**
   * Will ammend the login_hint parameter with `action:{action}` which will adjust texsts in certain flows.
   * Default: 'login'
   */
  action?: Action
  /**
   * Note: In most cases modifying this setting **is not needed**. Defaults will work with almost all React SPA cases.
   * By default @criipto/verify-react will do PKCE on your behalf and return a jwt token.
   * However if you wish you can disable this and get the raw `code` response by setting `response` to 'code'
  */
  response?: 'token' | 'code'
  /*
   * Note: In most cases modifying this setting **is not needed**. Defaults will work with almost all React SPA cases.
   * By default @criipto/verify-react will do as much as work on your behalf
   * by interpreting URL parameters and responses with `useCriiptoVerify()` via the default value 'client'.
   * If you wish to only render a UI and redirect to the Criipto IDP for server side code exchange, you can choose 'openidprovider'.
   */
  completionStrategy?: 'client' | 'openidprovider'
}

const ACTION_SUPPORTING_ACR_VALUES = [
  'urn:grn:authn:dk:mitid:low',
  'urn:grn:authn:dk:mitid:substantial',
  'urn:grn:authn:dk:mitid:high',
  'urn:grn:authn:se:bankid:same-device',
  'urn:grn:authn:se:bankid:another-device',
  'urn:grn:authn:se:bankid:another-qr',
];

function buildLoginHint(params: {options?: AuthorizeUrlParamsOptional, action?: Action}) {
  const {options, action} = params;
  const acrValues = options?.acrValues ? Array.isArray(options?.acrValues) ? options?.acrValues : [options?.acrValues] : [];
  let hints = options?.loginHint ? options?.loginHint.split(' ') : [];
  if (action) {
    if (acrValues.length === 1) {
      if (ACTION_SUPPORTING_ACR_VALUES.includes(acrValues[0])) {
        hints.push(`action:${action}`);  
      }
    } else {
      hints.push(`action:${action}`);
    }
  }
  return hints.length ? hints.join(' ') : undefined;
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

  const [result, setResult] = useState<Result | null>(null);
  const {redirectUri} = props;
  const responseType = props.response || 'token';
  const completionStrategy = props.completionStrategy || 'client';
  const action = props.action || 'login';

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
          loginHint: buildLoginHint({options, action})
        }));
      },
      generatePKCE: async () => {
        if (responseType !== 'token' || completionStrategy !== 'client') return;
        return await generatePKCE();
      },
      handleResponse: async (response, params) => {
        if (params.pkce && responseType === 'token') {
          let _redirectUri = params.redirectUri || redirectUri;
          if (!_redirectUri) throw new Error('redirectUri must be configured globally or per authentication component');

          await client.processResponse(response, {code_verifier: params.pkce.code_verifier, redirect_uri: _redirectUri}).then(response => {
            if (response?.code) setResult({code: response.code});
            else if (response?.id_token) setResult({id_token: response.id_token});
            else setResult(null);
          }).catch((err: OAuth2Error) => {
            setResult(err);
          });
        } else {
          if (response?.code) setResult({code: response.code});
          else if (response?.error) setResult(new OAuth2Error(response.error, response.error_description));
          else setResult(null);
        }
      },
      responseType,
      completionStrategy,
      result,
      domain: client.domain,
      redirectUri,
      action
    }
  }, [
    client,
    redirectUri,
    responseType,
    completionStrategy,
    result,
    action
  ]);

  return (
    <CriiptoVerifyContext.Provider value={context}>
      {props.children}
    </CriiptoVerifyContext.Provider>
  );
}

export default CriiptoVerifyProvider