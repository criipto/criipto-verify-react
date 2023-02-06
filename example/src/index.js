import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CriiptoVerifyProvider } from '@criipto/verify-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CriiptoVerifyProvider
      domain="natalia-test.criipto.id"
      clientID="urn:my:application:identifier:9676"
      redirectUri="http://localhost:3000"
      response="token"
      sessionStore={window.localStorage}
    >
      <App />
    </CriiptoVerifyProvider>
  </React.StrictMode>
);
