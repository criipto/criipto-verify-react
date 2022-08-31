import { AuthorizeUrlParamsOptional, parseAuthorizeParamsFromUrl } from "@criipto/auth-js";
import { createContext, useContext } from "react";

export type IsVerifyRuntimeContext = {
  isVerifyRuntime: true,
  authorizeOptions: AuthorizeUrlParamsOptional,
  domain: string,
  clientID: string
}

export type NonVerifyRuntimeContext = {
  isVerifyRuntime: false
}

const initialContext : NonVerifyRuntimeContext = {
  isVerifyRuntime: false
};

const VerifyRuntimeContext = createContext<IsVerifyRuntimeContext | NonVerifyRuntimeContext>(initialContext);

/**
 * @deprecated Internal Criipto runtime usage only.
 */
const VerifyRuntimeProvider = (props: {url: string, children: React.ReactNode}) : JSX.Element => {
  const authorizeOptions = parseAuthorizeParamsFromUrl(props.url);

  return (
    <VerifyRuntimeContext.Provider
      value={{
        isVerifyRuntime: true,
        authorizeOptions,
        domain: authorizeOptions.domain,
        clientID: authorizeOptions.clientID
      }}
    >
      {props.children}
    </VerifyRuntimeContext.Provider>
  );
}

const useVerifyRuntime = () => useContext(VerifyRuntimeContext);

export {VerifyRuntimeContext, VerifyRuntimeProvider, useVerifyRuntime};