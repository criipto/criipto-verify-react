import React from 'react';
import type { useCriiptoVerify } from '@criipto/verify-react';
import './App.css';

interface HeaderProps {
  handleLogout: () => void;
  user: ReturnType<typeof useCriiptoVerify>['claims'];
}

function Header({ handleLogout, user }: HeaderProps) {
  return (
    <header className="App-header">
      <h1>My Pension</h1>
      {user && (
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      )}
    </header>
  );
}

export default Header;
