import { useContext } from "react";
import CriiptoVerifyContext from "./context";

export default function useCriiptoVerify() {
  const {result, loginWithRedirect, loginWithPopup, acrValues, isLoading} = useContext(CriiptoVerifyContext);

  return {result, loginWithRedirect, loginWithPopup, acrValues, isLoading};
}