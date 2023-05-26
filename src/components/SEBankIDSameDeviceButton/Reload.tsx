import { PKCE } from '@criipto/auth-js';
import React, { useEffect, useState } from 'react';
import {Links, saveState, hydrateState, clearState} from './shared';

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
 * iOS Safari: Page reload on switch back scenario
 */

export default function SEBankIDSameDeviceReload(props: Props) {
  const {links, onError, onComplete, onInitiate, onLog, pkce, redirectUri} = props;

  const handleInitiate = () => {
    onLog('ReloadStrategy', 'handleInitiate');

    saveState({
      links,
      redirectUri,
      pkce
    });

    onInitiate();
  };

  useEffect(() => {
    const hydratedState = hydrateState();
    if (!hydratedState) return;
    clearState();
    onComplete(hydratedState.links.completeUrl);
  }, []);
  
  return React.cloneElement(props.children, {
    ...props.children.props,
    onClick: handleInitiate
  });
}