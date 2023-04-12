import { PKCE } from "@criipto/auth-js"
import { createMemoryStorage } from "../../memory-storage"

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

const stateStore = (() => {
  if (typeof sessionStorage === 'undefined') {
    console.warn('Creating memory store for PKCE values as no sessionStorage is available.');
    return createMemoryStorage();
  }
  return sessionStorage;
})();

export function hydrateState() : State | undefined {
  const rawState = stateStore.getItem(STATE_KEY);
  if (rawState) {
    return JSON.parse(rawState) as State;
  }

  return undefined;
}

export const autoHydratedState = hydrateState();

export function clearState() {
  stateStore.removeItem(STATE_KEY);
}

export function saveState(input: State) : void {
  stateStore.setItem(STATE_KEY, JSON.stringify(input));
}