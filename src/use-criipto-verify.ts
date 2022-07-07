import { useContext } from "react";
import CriiptoVerifyContext from "./context";

export default function useCriiptoVerify() {
  const {result} = useContext(CriiptoVerifyContext);

  return {result};
}