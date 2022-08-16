import { OAuth2Error, QrNotEnabledError, UserCancelledError } from '@criipto/auth-js';
import CriiptoConfiguration from '@criipto/auth-js/dist/CriiptoConfiguration';
import React, { useContext, useRef, useEffect , useState, useCallback } from 'react';
import CriiptoVerifyContext from '../context';

// Inlined types less readable (for library developers) but improves intellisense for consumers
const QRCode : React.FC<{
  children: (props: {
    qrElement: React.ReactElement
    /**
     * Will be true once the QR code has been scanned
     */
    isAcknowledged: boolean
    /**
     * Will be true if the user cancels the login on his mobile device
     */
    isCancelled: boolean
    /**
     * Whether or not QR codes are enabled for this Criipto Applicaiton
     */
    isEnabled: boolean | undefined
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
  const [criiptoConfiguration, setCriiptoConfiguration] = useState<CriiptoConfiguration | null>(null);

  useEffect(() => {
    let isSubsribed = true;
    
    client.fetchCriiptoConfiguration().then(c => {
      if (!isSubsribed) return;
      setCriiptoConfiguration(c);
    })

    return () => {
      isSubsribed = false;
    }
  }, [client]);

  const authorize = useCallback(() => {
    return client.qr.authorize(elementRef.current!, buildOptions());
  }, [client, buildOptions])

  useEffect (() => {
    if (!elementRef.current) return;
    if (error) return;

    const promise = authorize();

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

      setError(err);
      handleResponse(err, {});
    });

    return () => {
      promise.cancel();
    };
  }, [authorize, pkce, handleResponse, requestId, error]);

  const handleRetry = () => {
    setAcknowledged(false);
    setCancelled(false);
    setError(null);
    setRequestId(Math.random().toString());
  };

  const qrElement = <div ref={elementRef} />;
  return props.children({
    qrElement,
    isAcknowledged,
    isCancelled,
    isEnabled: criiptoConfiguration?.client.qr_enabled,
    error,
    retry: handleRetry
  });
}
export default QRCode;