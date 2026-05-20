# @criipto/verify-react

Accept MitID, Swedish BankID, Norwegian BankID and more logins in your React app with `@criipto/verify-react`.

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
  document.getElementById('root'),
);
```

You can find your domain and application client id on the [Criipto Dashboard](https://dashboard.criipto.com/).

Use the `useCriiptoVerify` hook + the `AuthMethodSelector` component in your React app to render a login screen.

```jsx
// src/App.js
import React from 'react';
import { useCriiptoVerify, AuthMethodSelector } from '@criipto/verify-react';
import '@criipto/verify-react/index.css';

export default function App() {
  const { result, error } = useCriiptoVerify();

  if (result?.id_token) {
    return <pre>{JSON.stringify(result.id_token, null, 2)}</pre>;
  }

  return (
    <React.Fragment>
      {error ? <p>An error occurred: {String(error)}. Please try again.</p> : null}
      <AuthMethodSelector />
    </React.Fragment>
  );
}
```

Always render the `error` field from `useCriiptoVerify`. It surfaces both **configuration errors** (e.g. invalid `domain` or `clientID`, or CORS) raised when the provider mounts, and **runtime errors** raised during a login attempt (e.g. user cancellation, OAuth2 errors from the IdP). Without rendering `error`, misconfiguration and failed logins will appear silent to the user.

## CORS

The library makes fetch requests to Criipto for two reasons:

1. To load application configuration when the provider mounts.
2. To push the authorization request (PAR) when a user clicks a login button.

Make sure that the origin your React app runs on is included in the list of callback URLs for your application. Otherwise, both calls will fail with CORS errors.

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
  document.getElementById('root'),
);
```

When a `sessionStore` is configured the library will store the id_token in your chosen storage (sessionStorage or localStorage) and invalidate the token once it expires.

The library will also attempt to retrieve a user token on page load via SSO (if your criipto domain has SSO enabled).

You may wish to increase the "Token lifetime" setting of your Criipto Application.

```jsx
// src/App.js
import React from 'react';
import { useCriiptoVerify, AuthMethodSelector, OAuth2Error } from '@criipto/verify-react';

export default function App() {
  const { claims, error, isLoading } = useCriiptoVerify();

  if (isLoading) {
    return <div>Loading</div>;
  }

  if (claims) {
    return <pre>{JSON.stringify(claims, null, 2)}</pre>;
  }

  return (
    <React.Fragment>
      {error ? (
        <p>
          An error occured:{' '}
          {error instanceof OAuth2Error
            ? `${error.error} (${error.error_description})`
            : String(error)}
          . Please try again.
        </p>
      ) : null}
      <AuthMethodSelector />
    </React.Fragment>
  );
}
```

### Logging Out

`@criipto/verify-react` offers the logout method you can use to clear session storage and log out of any existing SSO session.

```jsx
const {logout} = useCriiptoVerify();
...
<button onClick={() => logout({redirectUri: window.location.href})}>
  Log Out
</button>
```

## useEffect + loginWithRedirect

If you are triggering `loginWithRedirect` inside a `useEffect` hook, you need to allow the SDK time to initialize a few values before you redirect the user:

```jsx
const { isLoading, isInitializing, loginWithRedirect } = useCriiptoVerify();

useEffect(() => {
  if (isLoading || isInitializing) return;
  loginWithRedirect();
}, [isLoading, isInitializing]);
```

## Criipto

Learn more about Criipto and sign up for your free developer account at [criipto.com](https://www.criipto.com).
