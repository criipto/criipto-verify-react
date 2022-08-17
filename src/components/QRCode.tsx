import { OAuth2Error, QrNotEnabledError, savePKCEState, UserCancelledError } from '@criipto/auth-js';
import CriiptoConfiguration from '@criipto/auth-js/dist/CriiptoConfiguration';
import React, { useContext, useRef, useEffect , useState, useCallback } from 'react';
import CriiptoVerifyContext from '../context';

// Inlined types less readable (for library developers) but improves intellisense for consumers
const QRCode : React.FC<{
  margin?: number,
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
    retry: () => void,
    /**
     * A method for triggering a full screen redirect to authentication (useful if user is on mobile device already)
     */
    redirect: () => Promise<void>
  }) => React.ReactElement
}> = (props) => {
  const {children, margin} = props;
  const elementRef = useRef<HTMLDivElement>(null);
  const {client, buildOptions, buildAuthorizeUrl, handleResponse, pkce, store} = useContext(CriiptoVerifyContext);
  const [requestId, setRequestId] = useState(() => Math.random().toString());
  const [isAcknowledged, setAcknowledged] = useState(false);
  const [isCancelled, setCancelled] = useState(false);
  const [error, setError] = useState<OAuth2Error | Error | null>(null);
  const [criiptoConfiguration, setCriiptoConfiguration] = useState<CriiptoConfiguration | null>(null);
  const [redirectLink, setRedirectLink] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    if (!criiptoConfiguration) return;
    let isSubscribed = true;
    buildAuthorizeUrl().then(url => {
      if (!isSubscribed) return;
      const intermediaryUrl = (criiptoConfiguration.client.qr_intermediary_url ?? criiptoConfiguration.qr_intermediary_url).replace('/{id}', '').replace('{id}', '');
      const authorizeUrl = new URL(url);
      const authorizeParams = new URLSearchParams(authorizeUrl.search);
      authorizeParams.set('domain', authorizeUrl.hostname);
      authorizeUrl.hostname = new URL(intermediaryUrl).hostname;
      authorizeUrl.pathname = new URL(intermediaryUrl).pathname + '/authorize';

      authorizeUrl.search = authorizeParams.toString();
      setRedirectLink(authorizeUrl.toString());
    });
    return () => {
      isSubscribed = false;
    };
  }, [buildAuthorizeUrl, criiptoConfiguration]);

  const redirect = useCallback(async () => {
    if (!criiptoConfiguration) return;
    const intermediaryUrl = (criiptoConfiguration.client.qr_intermediary_url ?? criiptoConfiguration.qr_intermediary_url).replace('/{id}', '').replace('{id}', '');
    const authorizeUrl = new URL(await buildAuthorizeUrl());
    const authorizeParams = new URLSearchParams(authorizeUrl.search);
    authorizeParams.set('domain', authorizeUrl.hostname);
    authorizeUrl.hostname = new URL(intermediaryUrl).hostname;
    authorizeUrl.pathname = new URL(intermediaryUrl).pathname + '/authorize';
    authorizeUrl.search = authorizeParams.toString();

    if (pkce && "code_verifier" in pkce) {
      // just-in-time saving of PKCE, in case of man-in-the-browser
      savePKCEState(store, {
        response_type: 'id_token',
        pkce_code_verifier: pkce.code_verifier,
        redirect_uri: authorizeParams.get('redirect_uri')!
      });
    }

    window.location.href = authorizeUrl.toString();
  }, [buildAuthorizeUrl, criiptoConfiguration])

  const authorize = useCallback(() => {
    return client.qr.authorize(
      elementRef.current!,
      {
        ...buildOptions(),
        margin
    });
  }, [client, buildOptions, margin]);

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
  return children({
    qrElement,
    isAcknowledged,
    isCancelled,
    isEnabled: criiptoConfiguration?.client.qr_enabled,
    error,
    retry: handleRetry,
    redirect
  });
}
export default QRCode;