import CriiptoAuth, {OpenIDConfiguration, AuthorizeUrlParamsOptional, PKCE, AuthorizeResponse, OAuth2Error} from '@criipto/auth-js';
import { createContext } from 'react';

export type Result = {id_token: string} | {code: string} | OAuth2Error;
export type Action = 'confirm' | 'accept' | 'approve' | 'sign' | 'login';

export interface CriiptoVerifyContextInterface {
  loginWithRedirect: () => Promise<void>,
  fetchOpenIDConfiguration: () => Promise<OpenIDConfiguration>,
  buildAuthorizeUrl: (options?: AuthorizeUrlParamsOptional) => Promise<string>,
  generatePKCE: () => Promise<PKCE | undefined>,
  handleResponse: (response: AuthorizeResponse, params: {pkce?: PKCE, redirectUri?: string}) => Promise<void>,
  responseType: 'token' | 'code'
  completionStrategy: 'client' | 'openidprovider',
  result: Result | null
  domain: string
  redirectUri?: string,
  action: Action
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
  fetchOpenIDConfiguration: stub,
  buildAuthorizeUrl: stub,
  generatePKCE: stub,
  handleResponse: stub,
  responseType: 'token' as 'token' | 'code',
  completionStrategy: 'client' as 'client' | 'openidprovider',
  result: null,
  domain: '',
  action: 'login' as Action
};

const CriiptoVerifyContext = createContext<CriiptoVerifyContextInterface>(initialContext);

export default CriiptoVerifyContext;