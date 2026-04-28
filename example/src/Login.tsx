import React from 'react';
import './App.css';

interface LoginProps {
  children: React.ReactNode;
}

function Login({ children }: LoginProps) {
  return (
    <div className="login main">
      <p>Please login to access your pension savings.</p>
      {children}
    </div>
  );
}

export default Login;
