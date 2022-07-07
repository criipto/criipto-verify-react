import { PKCE } from "@criipto/auth-js"

export interface Links {
  cancelUrl: string
  completeUrl: string
  pollUrl: string
  launchLinks: {
    customFileHandlerUrl: string
    universalLink: string
  }
};

export interface State {
  pkce: PKCE | undefined
  redirectUri: string
  links: Links
}

const STATE_KEY = '@criipto/verify-react:sebankid:state';

export function hydrateState() : State | undefined {
  const rawState = sessionStorage.getItem(STATE_KEY);
  if (rawState) {
    return JSON.parse(rawState) as State;
  }

  return undefined;
}

export const autoHydratedState = hydrateState();

export function clearState() {
  sessionStorage.removeItem(STATE_KEY);
}

export function saveState(input: State) : void {
  sessionStorage.setItem(STATE_KEY, JSON.stringify(input));
}