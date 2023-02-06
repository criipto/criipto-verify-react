import React, { useState, useEffect } from 'react';
import { useCriiptoVerify, AuthMethodSelector } from '@criipto/verify-react';
import Header from './Header';
import Login from './Login';
import Loading from './Loading';
import Dashboard from './Dashboard';
import Footer from './Footer';
import './App.css';
import '@criipto/verify-react/dist/criipto-verify-react.css';

function App() {
  const { claims, isLoading } = useCriiptoVerify();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    if (claims) {
      setCurrentUser(claims);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(claims));
    }
  }, [claims]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  return (
    <React.Fragment>
      <Header handleLogout={handleLogout} isLoggedIn={isLoggedIn} />
      {isLoading && <Loading />}
      {isLoggedIn ? (
        <Dashboard user={currentUser} />
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
