import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CriiptoVerifyProvider } from '@criipto/verify-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CriiptoVerifyProvider
      domain="samples.criipto.id"
      clientID="urn:criipto:samples:criipto-verify-react"
      redirectUri="http://localhost:3000"
      sessionStore={window.localStorage}
    >
      <App />
    </CriiptoVerifyProvider>
  </React.StrictMode>
);
