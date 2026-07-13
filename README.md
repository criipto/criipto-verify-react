# @criipto/verify-react

The Idura Verify React SDK lets you authenticate users with European eID providers [supported by Idura](https://docs.idura.app/verify/e-ids/).

The SDK uses the [PKCE flow](https://docs.idura.app/verify/reference/authorization-flows/pkce/) suitable for public clients.

## Installation

```sh
npm install @criipto/verify-react
```

## Prerequisites

You need an Idura application to initialize the SDK. If you haven't already, follow the [dashboard setup guide](https://docs.idura.app/verify/getting-started/dashboard-setup/) to create one.

The SDK needs two values from your Idura application:

- your Idura domain
- your application client ID

## Initialize the SDK

Initialize the SDK by wrapping your React app in `CriiptoVerifyProvider`:

```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { CriiptoVerifyProvider } from '@criipto/verify-react';

import App from './App';

ReactDOM.render(
  <CriiptoVerifyProvider
    domain="{YOUR_IDURA_DOMAIN}"
    clientID="{YOUR_IDURA_APPLICATION_CLIENT_ID}"
    redirectUri={window.location.href}
  >
    <App />
  </CriiptoVerifyProvider>,
  document.getElementById('root'),
);
```

The `redirectUri` you pass to `CriiptoVerifyProvider` is where Idura returns the user after login, and it must be registered as a redirect URL on your Idura application. The examples use `window.location.href`, but any route (e.g. a dedicated `/callback` path) works too.

## Call the `useCriiptoVerify` hook

Inside a component wrapped by `CriiptoVerifyProvider`, call `useCriiptoVerify` to read the auth state and start a login.

```jsx
const {
  result,
  claims,
  error,
  loginWithRedirect,
  loginWithPopup,
  logout,
  isLoading,
  isInitializing,
} = useCriiptoVerify();
```

- `result`: the login outcome, `result.id_token` or `result.code` on success and an error otherwise
- `claims`: the decoded `id_token`
- `error`: configuration and login errors
- `loginWithRedirect` / `loginWithPopup`: start a login with redirect or in a popup window
- `logout`: clear the session store and end the SSO session
- `isLoading` / `isInitializing`: whether the SDK is still working or starting up

## Render login options

The SDK provides an `AuthMethodSelector` component that renders a method selector screen where your users can choose a login method.

By default, `AuthMethodSelector` shows one button per eID method enabled for your Idura application (**Applications → your app → eIDs** in the dashboard).

```jsx
// src/App.js
import React from 'react';
import { useCriiptoVerify, AuthMethodSelector } from '@criipto/verify-react';
import '@criipto/verify-react/index.css'; // Import the stylesheet, or the buttons render unstyled.

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

Always render the `error` field from `useCriiptoVerify`. It surfaces both **configuration errors** (e.g. invalid `domain` or `clientID`, or CORS) raised when the provider mounts, and **runtime errors** raised during a login attempt (e.g. user cancellation, or OAuth2 errors from the [identity provider (IdP)](https://docs.idura.app/verify/reference/glossary/#identity-provider-idp)). Without rendering `error`, misconfiguration and failed logins will appear silent to the user.

### Select eIDs programmatically

To control eID methods from your code instead of the dashboard, pass `acrValues` to `AuthMethodSelector`:

```jsx
<AuthMethodSelector
  acrValues={['urn:grn:authn:dk:mitid:substantial', 'urn:grn:authn:dk:mitid:high']}
/>
```

See the [Authorize URL Builder](https://docs.idura.app/verify/guides/authorize-url-builder) or individual eID pages for the full list of supported `acr_values`.

## Send the user directly to an eID login screen

If you don't need the method selector, use `loginWithRedirect` (or `loginWithPopup`) and pass a single eID method identifier in `acrValues`.

```jsx
// src/App.js
import React from 'react';
import { useCriiptoVerify } from '@criipto/verify-react';

export default function App() {
  const { result, loginWithRedirect } = useCriiptoVerify();

  if (result?.id_token) {
    return <pre>{JSON.stringify(result.id_token, null, 2)}</pre>;
  }

  return (
    <button onClick={() => loginWithRedirect({ acrValues: 'urn:grn:authn:dk:mitid:substantial' })}>
      Log in with MitID
    </button>
  );
}
```

## CORS

The SDK makes fetch requests to Idura for two reasons:

1. To load application configuration when the provider mounts.
2. To push the authorization request (PAR) when a user clicks a login button.

Make sure the origin your React app runs on is included in the list of redirect URLs for your Idura application. Otherwise, both calls will fail with CORS errors.

## Sessions

If you want to use the SDK for session management (rather than one-off authentication), you can configure a `sessionStore`:

```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { CriiptoVerifyProvider } from '@criipto/verify-react';

import App from './App';

ReactDOM.render(
  <CriiptoVerifyProvider
    domain="{YOUR_IDURA_DOMAIN}"
    clientID="{YOUR_IDURA_APPLICATION_CLIENT_ID}"
    redirectUri={window.location.href}
    sessionStore={window.sessionStorage} // or window.localStorage
  >
    <App />
  </CriiptoVerifyProvider>,
  document.getElementById('root'),
);
```

When a `sessionStore` is configured, the SDK stores the `id_token` in your chosen storage (`sessionStorage` or `localStorage`) and invalidates it once it expires.

The SDK will also attempt to retrieve the token on page load via SSO. (This requires SSO enabled on your Idura domain: check **Domains → your domain → SSO** section in the dashboard).

For longer sessions, you can increase the **Token lifetime** setting of your Idura application (**Applications → your app → Advanced Options**).

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
          An error occurred:{' '}
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

### Logging out

The `logout` method clears the session store and ends any existing SSO session.

```jsx
// src/App.js
import React from 'react';
import { useCriiptoVerify, AuthMethodSelector } from '@criipto/verify-react';
import '@criipto/verify-react/index.css';

export default function App() {
  const { claims, logout } = useCriiptoVerify();

  if (claims) {
    return (
      <React.Fragment>
        <pre>{JSON.stringify(claims, null, 2)}</pre>
        <button onClick={() => logout({ redirectUri: window.location.href })}>Log out</button>
      </React.Fragment>
    );
  }

  return <AuthMethodSelector />;
}
```

`logout` takes an optional `redirectUri` (where to send the user afterwards) and `state` (an opaque string used to mitigate CSRF attacks, see [state](https://docs.idura.app/verify/reference/request-parameters/#state)).

## useEffect + loginWithRedirect

If you are triggering `loginWithRedirect` inside a `useEffect` hook, you need to allow the SDK time to initialize a few values before you redirect the user:

```jsx
const { isLoading, isInitializing, loginWithRedirect } = useCriiptoVerify();

useEffect(() => {
  if (isLoading || isInitializing) return;
  loginWithRedirect();
}, [isLoading, isInitializing]);
```

## Idura

Learn more about Idura and sign up for a free developer account at [idura.eu](https://idura.eu).

### Why the package is named `@criipto/verify-react`

Idura was previously called Criipto, and most of our SDKs keep the `@criipto` name for backwards compatibility. You can read more about the rebrand in [our blog](https://idura.eu/blog/criipto-is-now-idura).
