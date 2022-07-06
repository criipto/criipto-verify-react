import CriiptoAuth, {OpenIDConfiguration, AuthorizeUrlParamsOptional, PKCE, AuthorizeResponse} from '@criipto/auth-js';
import { createContext } from 'react';
import { Result } from './provider';

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
  domain: '' 
};

const CriiptoVerifyContext = createContext<CriiptoVerifyContextInterface>(initialContext);

export default CriiptoVerifyContext;