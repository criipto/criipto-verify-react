import CriiptoAuth, {
  OpenIDConfiguration,
  type AuthorizeUrlParamsOptional,
  type PKCE,
  type AuthorizeResponse,
  OAuth2Error,
  type PKCEPublicPart,
  type Prompt,
} from '@criipto/auth-js';
import type { PopupAuthorizeParams, RedirectAuthorizeParams } from '@criipto/auth-js';
import { createContext } from 'react';

export type ResultSource = 'SEBankIDQrCode' | 'SEBankIDSameDeviceButton' | 'redirect' | 'popup';
export type Result =
  | { id_token: string; state?: string; source?: ResultSource }
  | { code: string; state?: string; source?: ResultSource }
  | OAuth2Error
  | Error;
export const actions = ['confirm', 'accept', 'approve', 'sign', 'login'] as const;
export type Action = (typeof actions)[number];
export type Claims = {
  iss: string;
  aud: string;
  identityscheme: string;
  authenticationtype: string;
  sub: string;
  iat: number;
  exp: number;
  [key: string]: string | number;
};

export interface BeforeAuthorizeParams {
  /**
   * The acr_values of the authorize request that is about to be made, always normalized to an array.
   * For logins started from a button or `AuthMethodSelector` this will hold exactly one value.
   */
  acrValues: string[];
  /**
   * The parameters the SDK is about to use, with `CriiptoVerifyProvider` configuration already applied.
   */
  options: AuthorizeUrlParamsOptional;
}

/**
 * Parameters to override for a single authorize request. Any field left out (or set to `undefined`)
 * keeps the value configured on `CriiptoVerifyProvider`.
 */
export interface BeforeAuthorizeOverrides {
  /**
   * Appended to the login_hint of this request, just like a `loginHint` passed directly to
   * `loginWithRedirect`. Use `action` and `message` rather than `action:`/`message:` hints,
   * as those are managed by the SDK.
   */
  loginHint?: string;
  action?: Action;
  message?: string;
  scope?: string;
  prompt?: Prompt;
  uiLocales?: string;
  state?: string;
  nonce?: string;
  extraUrlParams?: {
    [key: string]: string | null;
  };
}

export interface CriiptoVerifyContextInterface {
  loginWithRedirect: (params?: RedirectAuthorizeParams) => Promise<void>;
  loginWithPopup: (params?: PopupAuthorizeParams) => Promise<void>;
  checkSession: () => Promise<void>;
  logout: (params?: { redirectUri?: string; state?: string }) => Promise<void>;
  fetchOpenIDConfiguration: () => Promise<OpenIDConfiguration>;
  buildAuthorizeUrl: (options?: AuthorizeUrlParamsOptional) => Promise<string>;
  initializePAR: (options?: AuthorizeUrlParamsOptional) => Promise<URL>;
  generatePKCE: () => Promise<PKCE | undefined>;
  buildOptions: (
    options?: AuthorizeUrlParamsOptional | RedirectAuthorizeParams,
  ) => AuthorizeUrlParamsOptional;
  handleResponse: (
    response: AuthorizeResponse | (Error | OAuth2Error),
    params?: { pkce?: PKCE; redirectUri?: string; source?: ResultSource },
  ) => Promise<void>;
  responseType: 'token' | 'code';
  completionStrategy: 'client' | 'openidprovider';
  result: Result | null;
  claims: Claims | null;
  domain: string;
  redirectUri?: string;
  action: Action;
  message?: string;
  pkce?: PKCE | PKCEPublicPart;
  store: Storage;
  isLoading: boolean;
  isInitializing: boolean;
  acrValues?: string[];
  uiLocales?: string;
  client: CriiptoAuth;
  loginHint?: string;
}

/**
 * @ignore
 */
const stub = (): never => {
  throw new Error('You forgot to wrap your component in <CriiptoVerifyProvider>.');
};

/**
 * @ignore
 */
const initialContext = {
  loginWithRedirect: stub,
  loginWithPopup: stub,
  checkSession: stub,
  logout: stub,
  fetchOpenIDConfiguration: stub,
  buildAuthorizeUrl: stub,
  initializePAR: stub,
  generatePKCE: stub,
  buildOptions: stub,
  handleResponse: stub,
  responseType: 'token' as 'token' | 'code',
  completionStrategy: 'client' as 'client' | 'openidprovider',
  result: null,
  claims: null,
  domain: '',
  action: 'login' as Action,
  pkce: undefined,
  store: null as any as Storage,
  isLoading: false,
  isInitializing: true,
  client: null as any as CriiptoAuth,
  loginHint: undefined,
};

const CriiptoVerifyContext = createContext<CriiptoVerifyContextInterface>(initialContext);

export default CriiptoVerifyContext;
