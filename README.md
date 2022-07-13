# @criipto/verify-react

Accept MitID, NemID, Swedish BankID, Norwegian BankID and more logins in your React app with `@criipto/verify-react`.

## App switch support

`@criipto/verify-react` supports app switching for Swedish BankID and Danish MitID by a best-effort mobile-os detection and setting the relevant Criipto Verify login hints.

## Installation

Using [npm](https://npmjs.org/)

```sh
npm install @criipto/criipto-verify-react
```

## Getting Started

Setup the Criipto Verify SDK by wrapping your application in `CriiptoVerifyProvider`:

```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { CriiptoVerifyProvider } from '@criipto/verify-react';

import App from './App';

ReactDOM.render(
  <CriiptoVerifyProvider
    domain="{YOUR_CRIIPTO_DOMAIN}"
    clientID="{YOUR_CRIIPTO_APPLICATION_CLIENT_ID}"
    redirectUri={window.location.href}
  >
    <App />
  </CriiptoVerifyProvider>,
  document.getElementById('root')
);
```

You can find your domain and application client id on the [Criipto Dashboard](https://dashboard.criipto.com/).

Use the `useCriiptoVerify` hook + the `AuthMethodSelector` component in your React app to render a login screen.

```jsx
// src/App.js
import React from 'react';
import { useCriiptoVerify, AuthMethodSelector } from '@criipto/verify-react';

export default function App() {
  const {result} = useCriiptoVerify();

  if (result?.id_token) {
    return (
      <pre>
        {JSON.stringify(result.id_token, null, 2)}
      </pre>
    )
  } else {
    <React.Fragment>
      {result?.error ? (
        <p>
          An error occured: {result.error} ({result.error_description}). Please try again:
        </p>
      ) : null}
      <AuthMethodSelector />
    </React.Fragment>
  }
}
```

## XHR/fetch caveats

The library may require to do fetch requests against Criipto to fetch application configuration. Make sure that the host that the react app runs on is included in the list of callback URLs for your application.

## Criipto

Learn more about Criipto and sign up for your free developer account at [criipto.com](https://www.criipto.com).
