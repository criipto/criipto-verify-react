import React, {useMemo, useState, useCallback, useEffect} from 'react';
import CriiptoAuth, {AuthorizeUrlParamsOptional, clearPKCEState, generatePKCE, OAuth2Error, OpenIDConfiguration, PKCE, PKCEPublicPart, Prompt, savePKCEState, parseAuthorizeResponseFromLocation} from '@criipto/auth-js';

import CriiptoVerifyContext, {CriiptoVerifyContextInterface, Action, Result, Claims, actions} from './context';
import { AuthorizeResponse, PopupAuthorizeParams, RedirectAuthorizeParams, ResponseType } from '@criipto/auth-js/dist/types';

import '@criipto/auth-js/dist/index.css';
import { filterAcrValues } from './utils';
import jwtDecode from 'jwt-decode';
import useNow from './hooks/useNow';

const SESSION_KEY = `@criipto-verify-react/session`;
 
export interface CriiptoVerifyProviderOptions {
  domain: string
  clientID: string
  redirectUri?: string
  children: React.ReactNode
  pkce?: PKCEPublicPart
  state?: string
  prompt?: Prompt
  scope?: string
  uiLocales?: string
  loginHint?: string
  /**
   * Enables storage and automatic fetch of tokens
   * by utilizing browser storage and SSO silent logins.
   * Make sure "SSO for OAuth2" is enabled on your Criipto Domain.
   * Only works for `response: 'token'` (default)
   */
  sessionStore?: Storage,
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
    hints = hints.filter(h => !h.startsWith('action:'));
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

function parseAction(input?: string) : Action | undefined {
  if (!input) return;

  const segments = input.split(" ");
  const actionCandidate = segments.find(s => s.startsWith('action:'));
  if (!actionCandidate) return;
  const action = actionCandidate.replace('action:','');
  if (actions.includes(action as any)) return action as Action;
  return;
}

const store = sessionStorage;

const CriiptoVerifyProvider = (props: CriiptoVerifyProviderOptions) : JSX.Element => {
  const redirectUri = props.redirectUri || (window.location.origin + window.location.pathname);

  const client = useMemo(() => new CriiptoAuth({
    domain: props.domain,
    clientID: props.clientID,
    store,
    redirectUri: props.redirectUri
  }), [props.domain, props.clientID, props.redirectUri]);

  const [configuration, setConfiguration] = useState<OpenIDConfiguration | null>(null);
  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      const configuration = await client.fetchOpenIDConfiguration();
      if (isSubscribed) setConfiguration(configuration);
    })();

    return () => {
      isSubscribed = false;
    };
  }, [client]);

  const [result, setResult] = useState<Result | null>(null);
  const claims = useMemo(() => {
    if (!result) return null;
    if (!("id_token" in result)) return null;
    return jwtDecode<Claims>(result.id_token);
  }, [result]);
  const [isLoading, setIsLoading] = useState(false);
  const [pkce, setPKCE] = useState<PKCE | PKCEPublicPart | undefined>(props.pkce);
  const responseType = props.response || 'token';
  const completionStrategy = props.completionStrategy || 'client';
  const uiLocales = props.uiLocales;
  const loginHint = props.loginHint;
  const action = props.action ?? parseAction(loginHint) ?? 'login';
  const sessionStore = props.sessionStore;

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
      redirectUri,
      responseType: 'code' as ResponseType,
      ...options || {},
      state: props.state ?? options?.state,
      prompt: props.prompt ?? options?.prompt,
      scope: props.scope ?? options?.scope,
      uiLocales: uiLocales ?? options?.uiLocales,
      pkce: options?.pkce ?? pkce,
      loginHint: buildLoginHint({options, action})
    }
  }, [
    pkce,
    props.state,
    props.prompt,
    props.scope,
    uiLocales,
    action,
    redirectUri
  ]);

  const buildAuthorizeUrl = useCallback(async (options?: AuthorizeUrlParamsOptional) => {
    return await client.buildAuthorizeUrl(client.buildAuthorizeParams(buildOptions(options)));
  }, [client, buildOptions]);

  const handleResponse = useCallback(async (response : AuthorizeResponse | (Error | OAuth2Error), params: {pkce?: PKCE, redirectUri?: string}) => {
    if (response instanceof Error) {
      setResult(response);
    } else if (params.pkce && responseType === 'token') {
      let _redirectUri = params.redirectUri || redirectUri;
      if (!_redirectUri) throw new Error('redirectUri must be configured globally or per authentication component');

      await client.processResponse(response, {code_verifier: params.pkce.code_verifier, redirect_uri: _redirectUri}).then(response => {
        if (response?.code) setResult({code: response.code});
        else if (response?.id_token) {
          setResult({id_token: response.id_token});
          sessionStore?.setItem(SESSION_KEY, response.id_token);
        }
        else setResult(null);
      }).catch((err: OAuth2Error) => {
        setResult(err);
      });
    } else {
      if (response?.code) setResult({code: response.code});
      else if (response?.id_token) {
        setResult({id_token: response.id_token});
        sessionStore?.setItem(SESSION_KEY, response.id_token);
      }
      else if (response?.error) setResult(new OAuth2Error(response.error, response.error_description));
      else setResult(null);
    }

    refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
  }, [refreshPKCE, responseType, setResult, client, sessionStore]);

  const checkSession = useCallback(async () => {
    return client.checkSession({redirectUri}).then(response => {
      if (response?.code) setResult({code: response.code});
      else if (response?.id_token) {
        setResult({id_token: response.id_token});
        sessionStore?.setItem(SESSION_KEY, response.id_token);
      }
      else setResult(null);
    });
  }, [sessionStore, client, redirectUri]);

  const logout = useCallback(async (params?: {redirectUri?: string}) => {
    sessionStore?.removeItem(SESSION_KEY);
    await client.logout({
      redirectUri: params?.redirectUri ?? redirectUri
    });
  }, [sessionStore, client]);

  const context = useMemo<CriiptoVerifyContextInterface>(() => {
    return {
      loginWithRedirect: async (params) => {
        await client.redirect.authorize(buildOptions(params));
      },
      loginWithPopup: (params) => {
        return client.popup.authorize(buildOptions(params)).then(response => {
          if (response?.code) setResult({code: response.code});
          else if (response?.id_token) setResult({id_token: response.id_token});
          else setResult(null);
        }).catch((err: OAuth2Error) => {
          setResult(err);
        });
      },
      checkSession,
      logout,
      fetchOpenIDConfiguration: () => client.fetchOpenIDConfiguration(),
      buildAuthorizeUrl,
      generatePKCE: async () => {
        if (responseType !== 'token' || completionStrategy !== 'client') return;
        return await generatePKCE();
      },
      buildOptions,
      handleResponse,
      responseType,
      completionStrategy,
      result,
      claims,
      domain: client.domain,
      redirectUri,
      action,
      pkce,
      store,
      isLoading,
      acrValues: configuration ? filterAcrValues(configuration.acr_values_supported) : undefined,
      client,
      uiLocales
    }
  }, [
    client,
    redirectUri,
    responseType,
    completionStrategy,
    result,
    claims,
    action,
    pkce,
    props.state,
    props.prompt,
    isLoading,
    handleResponse,
    logout,
    configuration,
    uiLocales,
    checkSession
  ]);

  useEffect(() => {
    if (!client.redirect.hasMatch()) {
      refreshPKCE(); // Fresh request, setup PKCE
      return;
    }

    let isSubscribed = true;
    setIsLoading(true);

    const params = parseAuthorizeResponseFromLocation(window.location);
    if (params.code && responseType === 'code') {
      setIsLoading(false);
      setResult({code: params.code});
      refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
      return;
    }

    client.redirect.match().then(response => {
      if (!isSubscribed) return;
      setIsLoading(false);
      if (response?.code) setResult({code: response.code});
      else if (response?.id_token) setResult({id_token: response.id_token});
      else setResult(null);
      refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
    }).catch((err: OAuth2Error) => {
      if (!isSubscribed) return;
      setIsLoading(false);
      setResult(err);
      refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
    });

    return () => {
      isSubscribed = false;
    };
  }, [props.pkce, responseType]);

  /*
   * Fetch claims from session store if available
   */
  useEffect(() => {
    if (!sessionStore || claims) return;
    if (!claims) {
      // No result available, fetch from session store
      const token = sessionStore.getItem(SESSION_KEY);
      if (!token) return;

      setResult({id_token: token});
      return;
    }
  }, [sessionStore, claims]);
  
  /*
   * Unset result if claims are expired
   */
  useEffect(() => {
    if (!claims) return;
    if (!sessionStore) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (claims.exp < (now / 1000)) {
        setResult(null);
        sessionStore?.removeItem(SESSION_KEY);
        return;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionStore, claims, result]);

  /**
   * Fresh page load SSO check
   */
  useEffect(() => {
    if (!sessionStore) return;
    if (client.redirect.hasMatch()) return; // Do not issue SSO check if we're just being redirected back to
    if (sessionStore.getItem(SESSION_KEY)) return;
    let isSubscribed = true;

    setIsLoading(true);
    checkSession().catch(err => {
      console.error("session silent check error", err);
    }).finally(() => {
      if (isSubscribed) setIsLoading(false);
    });

    return () => {
      isSubscribed = false
    };
  }, [sessionStore, client, redirectUri]);

  return (
    <CriiptoVerifyContext.Provider value={context}>
      {props.children}
    </CriiptoVerifyContext.Provider>
  );
}

export default CriiptoVerifyProvider