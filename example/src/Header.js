import React from 'react';
import './App.css';

function Header({ handleLogout, user }) {
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
