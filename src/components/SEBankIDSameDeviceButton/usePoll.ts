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
    let timeout: string | undefined;
    const poll = async () => {
      const response = await fetch(pollUrl);

      if (response.status === 202) {
        setTimeout(poll, 1000);
      } else if (response.status >= 400) {
        const error = await response.text();
        onError(error);
      } else {
        const { targetUrl } = await response.json();
        onComplete(targetUrl);
      }
    };

    setTimeout(poll, 1000);
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [shouldPoll, pollUrl]);
}
