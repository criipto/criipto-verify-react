import React, {useMemo, useState, useCallback, useEffect} from 'react';
import CriiptoAuth, {AuthorizeUrlParamsOptional, clearPKCEState, generatePKCE, OAuth2Error, OpenIDConfiguration, PKCE, PKCEPublicPart, Prompt, savePKCEState, parseAuthorizeResponseFromLocation} from '@criipto/auth-js';

import CriiptoVerifyContext, {CriiptoVerifyContextInterface, Action, Result} from './context';
import { PopupAuthorizeParams, RedirectAuthorizeParams, ResponseType } from '@criipto/auth-js/dist/types';

import '@criipto/auth-js/dist/index.css';
import { filterAcrValues } from './utils';
 
export interface CriiptoVerifyProviderOptions {
  domain: string
  clientID: string
  redirectUri?: string
  children: React.ReactNode
  pkce?: PKCEPublicPart
  state?: string
  prompt?: Prompt
  uiLocales?: string
  /**
   * Will ammend the login_hint parameter with `action:{action}` which will adjust texsts in certain flows.
   * Default: 'login'
   */
  action?: Action
  /**
   * Note: In most cases modifying this setting **is not needed**. Defaults will work with almost all React SPA cases.
   * By default @criipto/verify-react will do PKCE on your behalf and return a jwt token.
   * However if you wish you can disable this and get the raw `code` response by setting `response` to 'code'.
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
  'urn:grn:authn:se:bankid:another-device:qr',
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
    } else if (acrValues.length >= 2) {
      if (acrValues.some(v => ACTION_SUPPORTING_ACR_VALUES.includes(v))) {
        hints.push(`action:${action}`);
      }
    } else {
      hints.push(`action:${action}`);
    }
  }
  return hints.length ? hints.join(' ') : undefined;
}

const store = sessionStorage;

const CriiptoVerifyProvider = (props: CriiptoVerifyProviderOptions) : JSX.Element => {
  const redirectUri = props.redirectUri || window.location.href;

  const [client] = useState(
    () => new CriiptoAuth({
      domain: props.domain,
      clientID: props.clientID,
      store,
      redirectUri: props.redirectUri
    })
  );

  const [configuration, setConfiguration] = useState<OpenIDConfiguration | null>(null);
  useEffect(() => {
    (async () => {
      setConfiguration(await client.fetchOpenIDConfiguration());
    })();
  }, [client]);

  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pkce, setPKCE] = useState<PKCE | PKCEPublicPart | undefined>(props.pkce);
  const responseType = props.response || 'token';
  const completionStrategy = props.completionStrategy || 'client';
  const action = props.action || 'login';

  const refreshPKCE = () => {
    if (props.pkce) return;
    if (responseType !== 'token' || completionStrategy !== 'client') {
      clearPKCEState(store);
      setPKCE(undefined);
      return;
    }

    clearPKCEState(store);

    (async () => {
      const pkce = await generatePKCE();
      setPKCE(pkce);
    })();
  }

  const buildOptions = useCallback((options?: AuthorizeUrlParamsOptional | RedirectAuthorizeParams) : AuthorizeUrlParamsOptional => {
    return {
      pkce,
      state: props.state,
      prompt: props.prompt,
      uiLocales: props.uiLocales,
      redirectUri,
      responseType: responseType === 'token' ? 'id_token' : 'code' as ResponseType,
      ...options || {},
      loginHint: buildLoginHint({options, action})
    }
  }, [
    pkce,
    props.state,
    props.prompt,
    props.uiLocales,
    action,
    redirectUri
  ]);

  const context = useMemo<CriiptoVerifyContextInterface>(() => {
    const buildAuthorizeUrl = async (options?: AuthorizeUrlParamsOptional) => {
      return await client.buildAuthorizeUrl(client.buildAuthorizeParams(buildOptions(options)));
    };

    return {
      loginWithRedirect: async (params?: AuthorizeUrlParamsOptional) => {
        await client.redirect.authorize(buildOptions(params));
      },
      loginWithPopup: (params?: PopupAuthorizeParams) => {
        return client.popup.authorize(buildOptions(params)).then(response => {
          if (response?.code) setResult({code: response.code});
          else if (response?.id_token) setResult({id_token: response.id_token});
          else setResult(null);
        }).catch((err: OAuth2Error) => {
          setResult(err);
        });
      },
      fetchOpenIDConfiguration: () => client.fetchOpenIDConfiguration(),
      buildAuthorizeUrl,
      generatePKCE: async () => {
        if (responseType !== 'token' || completionStrategy !== 'client') return;
        return await generatePKCE();
      },
      buildOptions,
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
          else if (response?.id_token) setResult({id_token: response.id_token});
          else if (response?.error) setResult(new OAuth2Error(response.error, response.error_description));
          else setResult(null);
        }

        refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
      },
      responseType,
      completionStrategy,
      result,
      domain: client.domain,
      redirectUri,
      action,
      pkce,
      store,
      isLoading,
      acrValues: configuration ? filterAcrValues(configuration.acr_values_supported) : undefined,
      client
    }
  }, [
    client,
    redirectUri,
    responseType,
    completionStrategy,
    result,
    action,
    pkce,
    props.state,
    props.prompt,
    isLoading,
    configuration
  ]);

  useEffect(() => {
    if (!client.redirect.hasMatch()) {
      refreshPKCE(); // Fresh request, setup PKCE
      return;
    }

    setIsLoading(true);

    const params = parseAuthorizeResponseFromLocation(window.location);
    if (params.code && responseType === 'code') {
      setIsLoading(false);
      setResult({code: params.code});
      refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
      return;
    }

    client.redirect.match().then(response => {
      setIsLoading(false);
      if (response?.code) setResult({code: response.code});
      else if (response?.id_token) setResult({id_token: response.id_token});
      else setResult(null);
      refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
    }).catch((err: OAuth2Error) => {
      setIsLoading(false);
      setResult(err);
      refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
    });
  }, [props.pkce, responseType]);

  return (
    <CriiptoVerifyContext.Provider value={context}>
      {props.children}
    </CriiptoVerifyContext.Provider>
  );
}

export default CriiptoVerifyProvider