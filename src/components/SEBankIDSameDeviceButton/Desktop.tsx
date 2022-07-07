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
export default function SEBankIDSameDeviceDesktop(props: Props) {
  const {links, onError, onComplete, onInitiate} = props;
  const [initiated, setInitiated] = useState(false);
  const {domain} = useContext(CriiptoVerifyContext);

  useEffect(() => {
    if (!initiated) return;
    
    let timeout : string | undefined;
    const poll = async () => {
      const response = await fetch(links.pollUrl);

      if (response.status === 202) {
        setTimeout(poll, 1000);
        return;
      } else if (response.status >= 400) {
        const error = await response.text();
        onError(error);
        return;
      } else {
        const {targetUrl} = await response.json();
        await onComplete(`https://${domain}${targetUrl}`);
        return;
      }
    };

    setTimeout(poll, 1000);
    return () => {
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