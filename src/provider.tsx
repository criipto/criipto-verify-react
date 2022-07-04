import React, {useMemo, useState} from 'react';
import CriiptoAuth from '@criipto/auth-js';

import CriiptoVerifyContext, {CriiptoVerifyContextInterface} from './context';

export interface CriiptoVerifyProviderOptions {
  domain: string
  clientID: string
  children: React.ReactNode
}
const CriiptoVerifyProvider = (props: CriiptoVerifyProviderOptions) : JSX.Element => {
  const [client] = useState(
    () => new CriiptoAuth({
      domain: props.domain,
      clientID: props.clientID,
      store: sessionStorage
    })
  );

  const context = useMemo<CriiptoVerifyContextInterface>(() => {
    return {
      loginWithRedirect: () => client.redirect.authorize({
        redirectUri: window.location.origin
      }),
      fetchOpenIDConfiguration: () => client.fetchOpenIDConfiguration()
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