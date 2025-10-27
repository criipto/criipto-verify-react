import { useState, useEffect } from 'react';

export default function useNow(isEnabled: () => boolean, refreshInterval: number = 30000) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const enabled = isEnabled();
    if (!enabled) {
      setNow(null);
      return;
    }

    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isEnabled]);

  return now;
}
