import { OAuth2Error, UserCancelledError } from '@criipto/auth-js';
import React, { useContext, useRef, useLayoutEffect, useState } from 'react';
import CriiptoVerifyContext from '../../context';

// Inlined types less readable (for library developers) but improves intellisense for consumers
const QRCode : React.FC<{
  children?: (props: {
    qrElement: React.ReactElement
    isAcknowledged: boolean
    isCancelled: boolean
    error: OAuth2Error | Error | null
    retry: () => void
  }) => React.ReactElement
}> = (props) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const {client, buildOptions, handleResponse, pkce} = useContext(CriiptoVerifyContext);
  const [requestId, setRequestId] = useState(() => Math.random().toString());
  const [isAcknowledged, setAcknowledged] = useState(false);
  const [isCancelled, setCancelled] = useState(false);
  const [error, setError] = useState<OAuth2Error | Error | null>(null);

  useLayoutEffect(() => {
    if (!elementRef.current) return;
    const promise = client.qr.authorize(elementRef.current!, buildOptions());

    promise.onAcknowledged = () => {
      setAcknowledged(true);
    };

    promise.then(response => {
      if (promise.cancelled) return;
      handleResponse(response, {
        pkce: pkce && "code_verifier" in pkce ? pkce : undefined
      });
    }).catch(err => {
      if (err instanceof UserCancelledError) {
        setCancelled(true);
        return;
      }
      if (promise.cancelled) return;

      setError(error);
      handleResponse({
        error: err
      }, {});
    });

    return () => {
      promise.cancel();
    };
  }, [elementRef.current, client, buildOptions, handleResponse, requestId]);

  const handleRetry = () => {
    setAcknowledged(false);
    setCancelled(false);
    setError(null);
    setRequestId(Math.random().toString());
  };

  const qrElement = <div ref={elementRef} />;
  if (props.children) {
    return props.children({
      qrElement,
      isAcknowledged,
      isCancelled,
      error,
      retry: handleRetry
    });
  }

  return qrElement;
}
export default QRCode;