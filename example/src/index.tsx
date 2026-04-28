import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CriiptoVerifyProvider } from '@criipto/verify-react';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <CriiptoVerifyProvider
      domain="samples.criipto.id"
      clientID="urn:criipto:samples:criipto:verify-react"
      sessionStore={window.localStorage}
    >
      <App />
    </CriiptoVerifyProvider>
  </React.StrictMode>,
);
