import React, { useContext, useEffect, useState } from 'react';
import CriiptoVerifyContext from '../../context';
import {Links} from './shared';

interface Props {
  children: React.ReactElement
  links: Links
  onError: (error: string) => void
  onComplete: (completeUrl: string) => Promise<void>
  onInitiate: () => void
  onLog: (...statements: string[]) => void
}

/*
 * Desktop: Polling scenario
 */
export default function SEBankIDSameDevicePoll(props: Props) {
  const {links, onError, onComplete, onInitiate} = props;
  const [initiated, setInitiated] = useState(false);
  const {domain} = useContext(CriiptoVerifyContext);

  useEffect(() => {
    if (!initiated) return;
    let isSubscribed = true;
    let timeout : string | undefined;
    const poll = async () => {
      if (!isSubscribed) return;
      const response = await fetch(links.pollUrl);

      if (response.status === 202) {
        setTimeout(poll, 1000);
        return;
      } else if (response.status >= 400) {
        if (!isSubscribed) return;
        const error = await response.text();
        onError(error);
        return;
      } else {
        if (!isSubscribed) return;
        const {targetUrl} = await response.json();
        await onComplete(targetUrl);
        return;
      }
    };

    setTimeout(poll, 1000);
    return () => {
      isSubscribed = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [initiated]);

  const handleInitiate = () => {
    onInitiate();
    setInitiated(true);
  };
  
  return React.cloneElement(props.children, {
    ...props.children.props,
    onClick: handleInitiate
  });
}