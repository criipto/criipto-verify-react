import React, { useContext, useState } from 'react';
import CriiptoVerifyContext from '../../context';
import { Links } from './shared';
import { usePoll } from './usePoll';

interface Props {
  children: React.ReactElement;
  links: Links;
  onError: (error: string) => void;
  onComplete: (completeUrl: string) => Promise<void>;
  onInitiate: () => void;
  onLog: (...statements: string[]) => void;
}

/*
 * Desktop: Polling scenario
 */
export default function SEBankIDSameDevicePoll(props: Props) {
  const { links, onError, onComplete, onInitiate } = props;
  const [initiated, setInitiated] = useState(false);
  const { domain } = useContext(CriiptoVerifyContext);

  usePoll({
    ...props,
    shouldPoll: initiated,
    pollUrl: links.pollUrl,
  });
  const handleInitiate = () => {
    onInitiate();
    setInitiated(true);
  };

  return React.cloneElement(props.children, {
    ...(props.children.props as any),
    onClick: handleInitiate,
  });
}
