import { createContext } from 'react';

export interface CriiptoVerifyContextInterface {
  loginWithRedirect: () => Promise<void>
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
  loginWithRedirect: stub
};

const CriiptoVerifyContext = createContext<CriiptoVerifyContextInterface>(initialContext);

export default CriiptoVerifyContext;