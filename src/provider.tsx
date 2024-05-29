import React, {useMemo, useState, useCallback, useEffect} from 'react';
import CriiptoAuth, {AuthorizeUrlParamsOptional, clearPKCEState, generatePKCE, OAuth2Error, OpenIDConfiguration, PKCE, PKCEPublicPart, Prompt, parseAuthorizeResponseFromLocation} from '@criipto/auth-js';

import CriiptoVerifyContext, {CriiptoVerifyContextInterface, Action, Result, Claims, actions, ResultSource} from './context';
import { AuthorizeResponse, RedirectAuthorizeParams, ResponseType } from '@criipto/auth-js/dist/types';

import { filterAcrValues, trySessionStorage, VERSION } from './utils';
import jwtDecode from 'jwt-decode';
import { createMemoryStorage } from './memory-storage';

const SESSION_KEY = `@criipto-verify-react/session`;
 
export interface CriiptoVerifyProviderOptions {
  domain: string
  clientID: string
  /**
   * @deprecated Development use only
   */
  protocol?: "https" | "http"

  redirectUri?: string
  children: React.ReactNode
  pkce?: PKCEPublicPart
  state?: string
  nonce?: string
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
   * Will ammend the login_hint parameter with `message:{base64(message)}` which will set a login/aprove message where available (Danish MitID).
   */
  message?: string
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
  completionStrategy?: 'client' | 'openidprovider',

  /**
   * @deprecated Criipto internal use
   */
  criiptoSdk?: null | string
}

export const ACTION_SUPPORTING_ACR_VALUES = [
  'urn:grn:authn:dk:mitid:low',
  'urn:grn:authn:dk:mitid:substantial',
  'urn:grn:authn:dk:mitid:high',
  'urn:grn:authn:se:bankid:same-device',
  'urn:grn:authn:se:bankid:another-device:qr',
];

export const MESSAGE_SUPPORTING_ACR_VALUES = [
  'urn:grn:authn:dk:mitid:low',
  'urn:grn:authn:dk:mitid:substantial',
  'urn:grn:authn:dk:mitid:high',
  'urn:grn:authn:se:bankid:same-device',
  'urn:grn:authn:se:bankid:another-device:qr'
];

export function buildLoginHint(loginHint: string | undefined | null, params: {options?: AuthorizeUrlParamsOptional, action?: Action, message?: string}) {
  const {options, action, message} = params;
  const acrValues = options?.acrValues ? Array.isArray(options?.acrValues) ? options?.acrValues : [options?.acrValues] : [];
  let hints = (loginHint ? loginHint.split(' ') : []).concat(options?.loginHint ? options?.loginHint.split(' ') : []).filter(hint => !hint.startsWith('message:') && !hint.startsWith('action:'));
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

  if (message) {
    if (acrValues.length === 1) {
      if (MESSAGE_SUPPORTING_ACR_VALUES.includes(acrValues[0])) {
        hints.push(`message:${btoa(message)}`);
      }
    } else if (acrValues.length >= 2) {
      if (acrValues.some(v => MESSAGE_SUPPORTING_ACR_VALUES.includes(v))) {
        hints.push(`message:${btoa(message)}`);
      }
    } else {
      hints.push(`message:${btoa(message)}`);
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

function tryBase64Decode(input: string) {
  try {
    return atob(input);
  }
  catch {
    return null;
  }
}
function parseMessage(input?: string) : string | undefined {
  if (!input) return;
  const segments = input.split(" ");
  const messageCandidate = segments.find(s => s.startsWith('message:'));
  if (!messageCandidate) return;

  const message = messageCandidate.replace('message:','');
  return tryBase64Decode(message) ?? message;
}

function defaultRedirectUri(input?: string) : string {
  if (input) return input;
  if (typeof window !== "undefined" && typeof window.location !== "undefined") {
    return window.location.origin + window.location.pathname;
  }

  throw new Error('Unable to determine default redirect uri, please provide a redirectUri');
}

const pkceStore = (() => {
  const sessionStorage = trySessionStorage();
  if (sessionStorage === null) {
    console.warn('Creating memory store for PKCE values as no sessionStorage is available. Authentication may be broken.');
    return createMemoryStorage();
  }
  return sessionStorage;
})();

const CriiptoVerifyProvider = (props: CriiptoVerifyProviderOptions) : JSX.Element => {
  const client = useMemo(() => 
    new CriiptoAuth({
      domain: props.domain,
      clientID: props.clientID,
      store: pkceStore,
      redirectUri: defaultRedirectUri(props.redirectUri),
      protocol: props.protocol
    }), [props.domain, props.clientID, props.redirectUri, props.protocol]
  );

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
  const [isInitializing, setIsInitializing] = useState(true);
  const [pkce, setPKCE] = useState<PKCE | PKCEPublicPart | undefined>(props.pkce);
  const responseType = props.response || 'token';
  const completionStrategy = props.completionStrategy || 'client';
  const uiLocales = props.uiLocales;
  const loginHint = props.loginHint;
  const action = props.action ?? parseAction(loginHint) ?? 'login';
  const message = props.message ?? parseMessage(loginHint);
  const sessionStore = props.sessionStore;

  const refreshPKCE = async () => {
    if (props.pkce) return props.pkce;
    if (responseType !== 'token' || completionStrategy !== 'client') {
      clearPKCEState(pkceStore);
      setPKCE(undefined);
      return undefined;
    }

    clearPKCEState(pkceStore);

    const pkce = await generatePKCE();
    setPKCE(pkce);
    return pkce;
  }

  const buildOptions = useCallback((options?: AuthorizeUrlParamsOptional | RedirectAuthorizeParams) : AuthorizeUrlParamsOptional => {
    return {
      redirectUri: defaultRedirectUri(props.redirectUri),
      responseType: 'code' as ResponseType,
      ...options || {},
      state: props.state ?? options?.state,
      nonce: props.nonce ?? options?.nonce,
      prompt: props.prompt ?? options?.prompt,
      scope: props.scope ?? options?.scope,
      uiLocales: uiLocales ?? options?.uiLocales,
      pkce: options?.pkce ?? pkce,
      loginHint: buildLoginHint(props.loginHint, {options, action, message}),
      extraUrlParams: props.criiptoSdk !== undefined ? {
        criipto_sdk: props.criiptoSdk
      } : {
        criipto_sdk: `@criipto/verify-react@${VERSION}`
      }
    }
  }, [
    pkce,
    props.state,
    props.nonce,
    props.prompt,
    props.scope,
    uiLocales,
    action,
    message,
    props.redirectUri,
    props.criiptoSdk,
    props.loginHint
  ]);

  const buildAuthorizeUrl = useCallback(async (options?: AuthorizeUrlParamsOptional) => {
    return await client.buildAuthorizeUrl(client.buildAuthorizeParams(buildOptions(options)));
  }, [client, buildOptions]);

  const handleResponse = useCallback(async (response : AuthorizeResponse | (Error | OAuth2Error), params: {pkce?: PKCE, redirectUri?: string, source?: ResultSource}) => {
    if (response instanceof OAuth2Error) {
      setResult(response);
    } else if (response instanceof Error) {
      setResult(response);
    } else if (params.pkce && responseType === 'token') {
      let _redirectUri = params.redirectUri || defaultRedirectUri(props.redirectUri);
      if (!_redirectUri) throw new Error('redirectUri must be configured globally or per authentication component');

      await client.processResponse(response, {code_verifier: params.pkce.code_verifier, redirect_uri: _redirectUri}).then(response => {
        if (response?.code) setResult({code: response.code, state: response.state, source: params.source});
        else if (response?.id_token) {
          setResult({id_token: response.id_token, state: response.state, source: params.source});
          sessionStore?.setItem(SESSION_KEY, response.id_token);
        }
        else setResult(null);
      }).catch((err: OAuth2Error) => {
        setResult(err);
      });
    } else {
      if (response?.code) setResult({code: response.code, state: response.state, source: params.source});
      else if (response?.id_token) {
        setResult({id_token: response.id_token, state: response.state, source: params.source});
        sessionStore?.setItem(SESSION_KEY, response.id_token);
      }
      else if (response?.error) setResult(new OAuth2Error(response.error, response.error_description, response.state));
      else setResult(null);
    }

    refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
  }, [refreshPKCE, responseType, setResult, client, sessionStore, props.redirectUri]);

  const checkSession = useCallback(async () => {
    return client.checkSession({redirectUri: defaultRedirectUri(props.redirectUri)}).then(response => {
      if (response?.code) setResult({code: response.code});
      else if (response?.id_token) {
        setResult({id_token: response.id_token});
        sessionStore?.setItem(SESSION_KEY, response.id_token);
      }
      else setResult(null);
    });
  }, [sessionStore, client, props.redirectUri]);

  const logout = useCallback(async (params?: {redirectUri?: string}) => {
    sessionStore?.removeItem(SESSION_KEY);
    await client.logout({
      redirectUri: params?.redirectUri ?? defaultRedirectUri(props.redirectUri)
    });
  }, [sessionStore, client, props.redirectUri]);

  const context = useMemo<CriiptoVerifyContextInterface>(() => {
    return {
      loginWithRedirect: async (params) => {
        const pkce = await refreshPKCE();
        await client.redirect.authorize(buildOptions({...params, pkce}));
      },
      loginWithPopup: async (params) => {
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
      redirectUri: defaultRedirectUri(props.redirectUri),
      action,
      message,
      pkce,
      store: pkceStore,
      isLoading,
      isInitializing,
      acrValues: configuration ? filterAcrValues(configuration.acr_values_supported) : undefined,
      client,
      uiLocales,
      loginHint
    }
  }, [
    client,
    props.redirectUri,
    responseType,
    completionStrategy,
    result,
    claims,
    action,
    message,
    pkce,
    props.state,
    props.prompt,
    isLoading,
    isInitializing,
    handleResponse,
    logout,
    configuration,
    uiLocales,
    checkSession,
    loginHint
  ]);

  useEffect(() => {
    setIsInitializing(false);
    if (!client.redirect.hasMatch()) {
      refreshPKCE(); // Fresh request, setup PKCE
      return;
    }

    let isSubscribed = true;
    setIsLoading(true);

    const params = parseAuthorizeResponseFromLocation(window.location);
    if (params.code && responseType === 'code') {
      setIsLoading(false);
      setResult({code: params.code, source: 'redirect', state: params.state});
      refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
      return;
    }
    
    (async () => {
      await Promise.resolve(); // wait for the initial cleanup in Strict mode - avoids double mutation
      if (!isSubscribed) return;

      try {
        const response = await client.redirect.match();
        if (!isSubscribed) return;

        if (response?.code) {
          setResult({code: response.code, source: 'redirect', state: response.state});
        }
        else if (response?.id_token) {
          setResult({id_token: response.id_token, source: 'redirect', state: response.state});
          sessionStore?.setItem(SESSION_KEY, response.id_token);
          resetRedirectState(window);
        }
        else setResult(null);
      } catch (err: any) {
        if (!isSubscribed) return;
        if (err instanceof OAuth2Error) {
          setResult(err);
        } else if (err instanceof Error) {
          setResult(err);
        } else {
          setResult(new Error(err?.toString() ?? 'Unknown error ocurred'));
        }
      } finally {
        if (!isSubscribed) return;
        setIsLoading(false);
        refreshPKCE(); // Clear out session storage and recreate PKCE values if being used
      }
    })();

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
    setIsInitializing(false);
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
  }, [sessionStore, client]);

  return (
    <CriiptoVerifyContext.Provider value={context}>
      {props.children}
    </CriiptoVerifyContext.Provider>
  );
}

export default CriiptoVerifyProvider

export function resetRedirectState(window: Window) {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');

  window.history.replaceState(
    {},
    window.document.title,
    url.pathname + url.search
  );
}