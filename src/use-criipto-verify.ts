import { useContext } from "react";
import CriiptoVerifyContext from "./context";

export default function useCriiptoVerify() {
  const {result, loginWithRedirect, isLoading} = useContext(CriiptoVerifyContext);

  return {result, loginWithRedirect, isLoading};
}