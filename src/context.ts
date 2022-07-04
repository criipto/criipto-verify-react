import OpenIDConfiguration from '@criipto/auth-js/dist/OpenID';
import { createContext } from 'react';

export interface CriiptoVerifyContextInterface {
  loginWithRedirect: () => Promise<void>,
  fetchOpenIDConfiguration: () => Promise<OpenIDConfiguration>
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
  fetchOpenIDConfiguration: stub
};

const CriiptoVerifyContext = createContext<CriiptoVerifyContextInterface>(initialContext);

export default CriiptoVerifyContext;