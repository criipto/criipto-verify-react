import { useContext } from "react";
import CriiptoVerifyContext from "./context";

export default function useCriiptoVerify() {
  const {result, loginWithRedirect, loginWithPopup, isLoading} = useContext(CriiptoVerifyContext);

  return {result, loginWithRedirect, loginWithPopup, isLoading};
}