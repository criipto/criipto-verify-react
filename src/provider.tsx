import React, {useMemo} from 'react';

import CriiptoVerifyContext, {CriiptoVerifyContextInterface} from './context';

export interface CriiptoVerifyProviderOptions {
  domain: string
  clientID: string
  children: React.ReactNode
}
const CriiptoVerifyProvider = (props: CriiptoVerifyProviderOptions) : JSX.Element => {
  const context = useMemo<CriiptoVerifyContextInterface>(() => {
    return {
      loginWithRedirect: () => Promise.resolve()
    }
  }, [

  ]);

  return (
    <CriiptoVerifyContext.Provider value={context}>
      {props.children}
    </CriiptoVerifyContext.Provider>
  );
}

export default CriiptoVerifyProvider