# @criipto/verify-react

Accept MitID, NemID, Swedish BankID, Norwegian BankID and more logins in your React app with `@criipto/verify-react`.

## App switch support

`@criipto/verify-react` supports app switching for Swedish BankID and Danish MitID by a best-effort mobile-os detection and setting the relevant Criipto Verify login hints.

## Installation

Using [npm](https://npmjs.org/)

```sh
npm install @criipto/verify-react
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
import '@criipto/verify-react/dist/criipto-verify-react.css';

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

## Sessions

If you want to use `@criipto/verify-react` for session management (rather than one-off authentication) you can configure a `sessionStore`:

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
    sessionStore={window.sessionStorage} // or window.localStorage
  >
    <App />
  </CriiptoVerifyProvider>,
  document.getElementById('root')
);
```

When a `sessionStore` is configured the library will store the id_token in your chosen storage (sessionStorage or localStorage) and invalidate the token once it expires.

The library will also attempt to retrieve a user token on page load via SSO (if your criipto domain has SSO enabled).

You may wish to increase the "Token lifetime" setting of your Criipto Application.

```jsx
// src/App.js
import React from 'react';
import { useCriiptoVerify, AuthMethodSelector } from '@criipto/verify-react';

export default function App() {
  const {claims, error, isLoading} = useCriiptoVerify();

  if (isLoading) {
    return <div>Loading</div>
  }
  else if (claims) {
    return (
      <pre>
        {JSON.stringify(claims, null, 2)}
      </pre>
    )
  } else {
    <React.Fragment>
      {error ? (
        <p>
          An error occured: {error.error} ({error.error_description}). Please try again:
        </p>
      ) : null}
      <AuthMethodSelector />
    </React.Fragment>
  }
}
```

### Logging Out

`@criipto/verify-react` offers the logout method you can use to clear session storage and log out of any existing SSO session. 

```jsx
const {logout} = useCriiptoVerify();
...
<button onClick={()=>logout(window.location.href)}>
  Log Out
</button>
```

## XHR/fetch caveats

The library may require to do fetch requests against Criipto to fetch application configuration. Make sure that the host that the react app runs on is included in the list of callback URLs for your application.

## Criipto

Learn more about Criipto and sign up for your free developer account at [criipto.com](https://www.criipto.com).
