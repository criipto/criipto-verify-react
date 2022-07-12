import { useContext } from "react";
import CriiptoVerifyContext from "./context";

export default function useCriiptoVerify() {
  const {result, loginWithRedirect} = useContext(CriiptoVerifyContext);

  return {result, loginWithRedirect};
}