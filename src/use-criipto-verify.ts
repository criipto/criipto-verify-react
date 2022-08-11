import { useContext } from "react";
import CriiptoVerifyContext from "./context";

export default function useCriiptoVerify() {
  const {result, claims, loginWithRedirect, loginWithPopup, acrValues, isLoading, logout, checkSession} = useContext(CriiptoVerifyContext);

  return {
    result,
    /**
     * The claims of the decoded id_token (if available)
     */
    claims,
    error: result && "error" in result ? result : null,
    loginWithRedirect,
    loginWithPopup,
    acrValues,
    /**
     * Will be true when performing token exchange after redirect or during an initial SSO check
     */
    isLoading,
    /**
     * Check if there is an existing SSO session.
     */
    checkSession,
    /**
     * Clear local session store and logout of any existing SSO session
     */
    logout
  };
}