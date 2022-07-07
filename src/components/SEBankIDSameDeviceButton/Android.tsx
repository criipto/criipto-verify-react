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
 * Android: Background/Foreground scenario
 */
export default function SEBankIDSameDeviceAndroid(props: Props) {
  const {links, onError, onComplete, onInitiate, onLog} = props;
  const [initiated, setInitiated] = useState(false);

  usePageVisibility(async () => {
    onLog('android', 'onForeground', initiated.toString());
    if (!initiated) return;
    
    onComplete(links.completeUrl);
  }, [links, initiated]);

  const handleInitiate = () => {
    onLog('android', 'handleInitiate');
    onInitiate();
    setInitiated(true);
  };
  
  return React.cloneElement(props.children, {
    ...props.children.props,
    onClick: handleInitiate
  });
}