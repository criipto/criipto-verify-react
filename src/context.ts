import CriiptoAuth, {OpenIDConfiguration, AuthorizeUrlParamsOptional} from '@criipto/auth-js';
import { createContext } from 'react';

export interface CriiptoVerifyContextInterface {
  loginWithRedirect: () => Promise<void>,
  fetchOpenIDConfiguration: () => Promise<OpenIDConfiguration>,
  buildAuthorizeUrl: (options?: AuthorizeUrlParamsOptional) => Promise<string>,
  responseType: 'token' | 'code'
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
  responseType: 'token'
};

const CriiptoVerifyContext = createContext<CriiptoVerifyContextInterface>(initialContext);

export default CriiptoVerifyContext;