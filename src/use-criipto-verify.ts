import { useContext } from "react";
import CriiptoVerifyContext from "./context";

export default function useCriiptoVerify() {
  const {result, claims, loginWithRedirect, loginWithPopup, acrValues, isLoading, logout} = useContext(CriiptoVerifyContext);

  return {
    result,
    claims,
    error: result && "error" in result ? result : null,
    loginWithRedirect,
    loginWithPopup,
    acrValues,
    isLoading,
    logout
  };
}