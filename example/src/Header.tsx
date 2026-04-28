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
      <p>Example Pension App</p>
      {user && (
        <button className="logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      )}
    </header>
  );
}

export default Header;
