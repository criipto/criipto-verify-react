import React, { useRef, useState, useEffect } from 'react';

export default function usePageVisibility(onVisible? : () => void) {
  const visibilityState = useRef(document.visibilityState);
  const [state, setState] = useState(visibilityState.current);

  useEffect(() => {
    document.addEventListener('visibilitychange', _handleVisibilityChange);

    document.addEventListener('pagehide', event => {
      console.log('pageHide', event);
    });

    return () => {
      document.removeEventListener('visibilitychange', _handleVisibilityChange);
    };
  }, []);

  const _handleVisibilityChange = () => {
    console.log(document.visibilityState);
    const nextState = document.visibilityState;
    if (
      visibilityState.current.match(/hidden/) &&
      nextState === 'visible'
    ) {
      if (onVisible) onVisible();
    }

    visibilityState.current = nextState;
    setState(visibilityState.current);
  };

  return state;
}