import React from 'react';
import './App.css';

function Login({ children }) {
  return (
    <div className="login main">
      <p>Please login to access your pension savings.</p>
      {children}
    </div>
  );
}

export default Login;
