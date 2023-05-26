import React, { useState } from 'react';
import usePageVisibility from '../../hooks/usePageVisibility';
import {Links} from './shared';

interface Props {
  children: React.ReactElement,
  links: Links,
  onError: (error: string) => void
  onComplete: (completeUrl: string) => Promise<void>
  onInitiate: () => void
  onLog: (...statements: string[]) => void
}

/*
 * Android + iOS Chrome: Background/Foreground scenario
 */
export default function SEBankIDSameDeviceForeground(props: Props) {
  const {links, onError, onComplete, onInitiate, onLog} = props;
  const [initiated, setInitiated] = useState(false);

  usePageVisibility(async () => {
    onLog('ForegroundStrategy', 'onForeground', initiated.toString());
    if (!initiated) return;
    
    onComplete(links.completeUrl);
  }, [links, initiated]);

  const handleInitiate = () => {
    onLog('ForegroundStrategy', 'handleInitiate');
    onInitiate();
    setInitiated(true);
  };
  
  return React.cloneElement(props.children, {
    ...props.children.props,
    onClick: handleInitiate
  });
}