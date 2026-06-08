import { useContext } from 'react';
import CriiptoVerifyContext from './context';

export default function useCriiptoVerify() {
  const {
    result,
    claims,
    loginWithRedirect,
    loginWithPopup,
    acrValues,
    isLoading,
    isInitializing,
    logout,
    checkSession,
  } = useContext(CriiptoVerifyContext);

  return {
    result,
    /**
     * The claims of the decoded id_token (if available)
     */
    claims,
    /**
     * Set when the provider failed to fetch configuration (e.g. invalid `domain`/`clientID`,
     * or CORS), or when an authentication attempt failed (e.g. user cancellation, OAuth2 errors
     * from the IdP). Always render this in your UI — failures are otherwise silent.
     *
     * `OAuth2Error` for IdP-returned errors, `Error` for everything else.
     */
    error: result && ('error' in result || result instanceof Error) ? result : null,
    loginWithRedirect,
    loginWithPopup,
    acrValues,
    /**
     * Will be true when performing token exchange after redirect or during an initial SSO check
     */
    isLoading,
    /**
     * Will be true until the first set of useEffect hooks have been called
     */
    isInitializing,
    /**
     * Check if there is an existing SSO session.
     */
    checkSession,
    /**
     * Clear local session store and logout of any existing SSO session
     */
    logout,
  };
}
