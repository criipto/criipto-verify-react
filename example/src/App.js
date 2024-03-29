import React from 'react';
import { useCriiptoVerify, AuthMethodSelector } from '@criipto/verify-react';
import Header from './Header';
import Login from './Login';
import Loading from './Loading';
import Dashboard from './Dashboard';
import Footer from './Footer';
import './App.css';
import '@criipto/verify-react/dist/criipto-verify-react.css';

function App() {
  const { claims, isLoading, logout, error } = useCriiptoVerify();

  const handleLogout = () => {
    logout('http://localhost:3000');
  };

  return (
    <React.Fragment>
      <Header handleLogout={handleLogout} user={claims} />
      {isLoading && <Loading />}
      {error ? (
        <p>
          An error occurred: {error.error} ({error.error_description})
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
