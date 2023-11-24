import React, {createContext} from "react";
import AuthMethodButton, { AuthMethodButtonProps } from "./AuthMethodButton";
import SEBankIDQrCode from "./SEBankIDQRCode";

interface AuthButtonGroupContextInterface {
  multiple: boolean,
  acrValues: string[]
}
const initialContext : AuthButtonGroupContextInterface = {
  multiple: false,
  acrValues: []
};
export const AuthButtonGroupContext = createContext<AuthButtonGroupContextInterface>(initialContext);

export default function AuthButtonGroup(props: {
  children: React.ReactNode,
}) {
  const acrValues = React.Children.toArray(props.children).flatMap(child => {
    if (!child || typeof child !== 'object') return [];
    if ("type" in child) {
      if (child.type === AuthMethodButton) {
        const props = child.props as AuthMethodButtonProps;
        return props.acrValue ? [props.acrValue] : [];
      }
      if (child.type === SEBankIDQrCode) {
        return ['urn:grn:authn:se:bankid:another-device:qr'];
      }
    }
    return [];
  });

  const context : AuthButtonGroupContextInterface = {
    multiple: acrValues.length > 1,
    acrValues
  };
  return (
    <AuthButtonGroupContext.Provider value={context}>
      {props.children}
    </AuthButtonGroupContext.Provider>
  )
}