import React from 'react';
import { useCriiptoVerify, AuthMethodSelector, OAuth2Error } from '@criipto/verify-react';
import Header from './Header';
import Login from './Login';
import Loading from './Loading';
import Dashboard from './Dashboard';
import Footer from './Footer';
import './App.css';
import '@criipto/verify-react/index.css';

function App() {
  const { claims, isLoading, logout, error } = useCriiptoVerify();

  const handleLogout = () => {
    logout({ redirectUri: 'http://localhost:3000' });
  };

  return (
    <React.Fragment>
      <Header handleLogout={handleLogout} user={claims} />
      {isLoading && <Loading />}
      {error ? (
        <p>
          An error occurred:{' '}
          {error instanceof OAuth2Error
            ? `${error.error} (${error.error_description})`
            : String(error)}
        </p>
      ) : null}
      {claims ? (
        <Dashboard user={claims} />
      ) : (
        <Login>
          <AuthMethodSelector />
        </Login>
      )}
      <Footer />
    </React.Fragment>
  );
}

export default App;
