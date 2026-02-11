import React, { useCallback, useEffect, useState } from 'react';
import usePageVisibility from '../../hooks/usePageVisibility';
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
 * Android + iOS Chrome: Background/Foreground scenario
 */
export default function SEBankIDSameDeviceForeground(props: Props) {
  const { links, onInitiate, onLog } = props;
  const [initiated, setInitiated] = useState(false);

  // Polling might complete while the browser is in the background, but we don't want to invoke the
  // complete callbacks before the browser is focused. So we store the result here.
  const [result, setResult] = useState<{ result: string } | { error: string } | null>(null);

  const onComplete = useCallback((completeUrl: string) => setResult({ result: completeUrl }), []);
  const onError = useCallback((error: string) => setResult({ error: error }), []);

  const visibility = usePageVisibility(() => {
    onLog('ForegroundStrategy', 'onForeground', initiated.toString());
  }, [initiated]);

  useEffect(() => {
    if (result && visibility === 'visible') {
      if ('result' in result) {
        props.onComplete(result.result);
      } else if ('error' in result) {
        props.onError(result.error);
      }
      // Clear result, so we don't call error / complete several times, if visibility changes
      setResult(null);
    }
  }, [result, visibility]);

  usePoll({
    shouldPoll: initiated,
    pollUrl: links.pollUrl,
    onComplete,
    onError,
  });

  const handleInitiate = () => {
    onLog('ForegroundStrategy', 'handleInitiate');
    onInitiate();
    setInitiated(true);
  };

  return React.cloneElement(props.children, {
    ...(props.children.props as any),
    onClick: handleInitiate,
  });
}
