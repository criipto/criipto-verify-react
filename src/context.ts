import CriiptoAuth, {OpenIDConfiguration, AuthorizeUrlParamsOptional, PKCE, AuthorizeResponse, OAuth2Error, PKCEPublicPart} from '@criipto/auth-js';
import { PopupAuthorizeParams, RedirectAuthorizeParams } from '@criipto/auth-js/dist/types';
import { createContext } from 'react';

export type Result = {id_token: string, state?: string} | {code: string, state?: string} | OAuth2Error | Error;
export const actions = ['confirm', 'accept', 'approve', 'sign', 'login'] as const;
export type Action = typeof actions[number];
export type Claims = {
  iss: string
  aud: string
  identityscheme: string
  authenticationtype: string
  sub: string
  iat: number
  exp: number
  [key: string]: string | number
}

export interface CriiptoVerifyContextInterface {
  loginWithRedirect: (params?: RedirectAuthorizeParams) => Promise<void>,
  loginWithPopup: (params?: PopupAuthorizeParams) => Promise<void>,
  checkSession: () => Promise<void>,
  logout: (params?: {redirectUri?: string}) => Promise<void>,
  fetchOpenIDConfiguration: () => Promise<OpenIDConfiguration>,
  buildAuthorizeUrl: (options?: AuthorizeUrlParamsOptional) => Promise<string>,
  generatePKCE: () => Promise<PKCE | undefined>,
  buildOptions: (options?: AuthorizeUrlParamsOptional | RedirectAuthorizeParams) => AuthorizeUrlParamsOptional
  handleResponse: (response: AuthorizeResponse, params: {pkce?: PKCE, redirectUri?: string}) => Promise<void>,
  responseType: 'token' | 'code'
  completionStrategy: 'client' | 'openidprovider',
  result: Result | null
  claims: Claims | null
  domain: string
  redirectUri?: string,
  action: Action,
  message?: string,
  pkce?: PKCE | PKCEPublicPart,
  store: Storage,
  isLoading: boolean,
  acrValues?: string[],
  uiLocales?: string,
  client: CriiptoAuth
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
  client: null as any as CriiptoAuth
};

const CriiptoVerifyContext = createContext<CriiptoVerifyContextInterface>(initialContext);

export default CriiptoVerifyContext;