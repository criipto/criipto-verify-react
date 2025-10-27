import React, { useRef, useState, useEffect } from 'react';

export default function usePageVisibility(onVisible?: () => void, deps: React.DependencyList = []) {
  const visibilityState = useRef(document.visibilityState);
  const [state, setState] = useState(visibilityState.current);

  useEffect(() => {
    document.addEventListener('visibilitychange', _handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', _handleVisibilityChange);
    };
  }, deps);

  const _handleVisibilityChange = () => {
    const nextState = document.visibilityState;
    if (visibilityState.current === 'hidden' && nextState === 'visible') {
      if (onVisible) onVisible();
    }

    visibilityState.current = nextState;
    setState(visibilityState.current);
  };

  return state;
}
