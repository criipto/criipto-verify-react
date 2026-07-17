import React from 'react';
import './App.css';

interface LoginProps {
  children: React.ReactNode;
}

function Login({ children }: LoginProps) {
  return (
    <div className="login main">
      <p>Log in to view your pension savings</p>
      {children}
    </div>
  );
}

export default Login;
