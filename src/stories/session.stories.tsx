import React from 'react';

import CriiptoVerifyProvider from '../provider';
import AuthMethodSelector from '../components/AuthMethodSelector';
import useCriiptoVerify from '../use-criipto-verify';

export default {
  title: 'Session',
  argTypes: {
    storage: {
      name: 'Storage',
      control: 'select',
      options: ['sessionStorage', 'localStorage'],
      defaultValue: 'sessionStorage'
    }
  }
}

const Session : React.FC = () => {
  const {claims, error, isLoading, logout} = useCriiptoVerify();

  if (isLoading) {
    return <span>Loading ...</span>;
  }
  if (error) {
    return <span>{error.error} {error.error_description}</span>;
  }
  if (claims) {
    return (
      <div>
        <pre>{JSON.stringify(claims, null, 2)}</pre>
        <button onClick={() => logout()}>Logout</button>
      </div>
    );
  }

  return (
    <AuthMethodSelector />
  );
};

const SessionTemplate = (args: any, {globals} : any) => {
  return (
    <CriiptoVerifyProvider 
      domain={globals.domain}
      clientID={globals.clientID}
      response="token"
      sessionStore={args.storage === 'localStorage' ? window.localStorage : window.sessionStorage}
    >
      <Session />
    </CriiptoVerifyProvider>
  );
};

export const SessionStorage = SessionTemplate.bind({});
SessionStorage.args = {
  storage: 'sessionStorage'
};
export const LocalStorage = SessionTemplate.bind({});
LocalStorage.args = {
  storage: 'localStorage'
};