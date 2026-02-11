import { useEffect } from 'react';

export interface UsePollProps {
  shouldPoll: boolean;
  pollUrl: string;
  onError: (error: string) => void;
  onComplete: (completeUrl: string) => void;
}

export function usePoll({ shouldPoll, pollUrl, onComplete, onError }: UsePollProps) {
  useEffect(() => {
    if (!shouldPoll) return;
    let isSubscribed = true;
    let timeout: string | undefined;
    const poll = async () => {
      if (!isSubscribed) return;
      const response = await fetch(pollUrl);

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
        const { targetUrl } = await response.json();
        onComplete(targetUrl);
        return;
      }
    };

    setTimeout(poll, 1000);
    return () => {
      isSubscribed = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [shouldPoll, pollUrl]);
}
