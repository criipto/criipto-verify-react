import { PKCE } from '@criipto/auth-js';
import React, { useEffect, useState } from 'react';
import {Links, saveState, autoHydratedState, clearState} from './shared';

interface Props {
  children: React.ReactElement,
  links: Links,
  onError: (error: string) => void
  onComplete: (completeUrl: string) => Promise<void>
  onInitiate: () => void
  onLog: (...statements: string[]) => void,
  pkce: PKCE | undefined,
  redirectUri: string
}

/*
 * iOS: Page reload on switch back scenario
 */
export default function SEBankIDSameDeviceIOS(props: Props) {
  const {links, onError, onComplete, onInitiate, onLog, pkce, redirectUri} = props;

  const handleInitiate = () => {
    onLog('iOS', 'handleInitiate');

    saveState({
      links,
      redirectUri,
      pkce
    });

    onInitiate();
  };

  useEffect(() => {
    if (!autoHydratedState) return;
    clearState();
    onComplete(autoHydratedState.links.completeUrl);
  }, []);
  
  return React.cloneElement(props.children, {
    ...props.children.props,
    onClick: handleInitiate
  });
}