import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthorizeResponse, savePKCEState } from '@criipto/auth-js';
import QRCode from 'qrcode';

import CriiptoVerifyContext from "../context";

// import logoSrc from './SEBankIDQRCode/logo@2x.png';

interface Props {
  redirectUri?: string,
  qrMargin?: number
}

interface QrResponse {
  initialQrCode: string
  pollUrl: string
}
interface PollResponse {
  qrCode?: string
  targetUrl?: string
}

function searchParamsToPOJO(input: URLSearchParams) {
  return Array.from(input.keys()).reduce((memo : {[key: string]: string}, key) => {
    memo[key] = input.get(key)!;
    return memo;
  }, {});
}

// const logo = new Image();
// logo.src = logoSrc;

// const LOGO_RATIO = 0.15;

export default function SEBankIDQrCode(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {buildAuthorizeUrl, completionStrategy, pkce, handleResponse, redirectUri: defaultRedirectURi} = useContext(CriiptoVerifyContext);
  const redirectUri = props.redirectUri || defaultRedirectURi;
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pollUrl, setPollUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setQrCode(null);
    setPollUrl(null);

    buildAuthorizeUrl({
      acrValues: 'urn:grn:authn:se:bankid:another-device:qr',
      responseMode: 'json',
      pkce,
      redirectUri
    }).then(url => {
      return fetch(url).then(response => response.json() as Promise<QrResponse>);
    })
    .then(response => {
      setQrCode(response.initialQrCode);
      setPollUrl(response.pollUrl);
    })
    .catch(console.error);
  }, [buildAuthorizeUrl, redirectUri]);
  useEffect(() => {
    refresh();
  }, [refresh, pkce]);

  const handleError = useCallback((error: string) => {
    setError(error);
    handleResponse({error}, {pkce: pkce && "code_verifier" in pkce ? pkce : undefined, redirectUri});
  }, [pkce, redirectUri]);

  const handleComplete = useCallback(async (completeUrl: string) => {
    const required = {pkce};
    refresh();

    const completeResponse = await fetch(completeUrl);
    if (completeResponse.status >= 400) {
      handleError(await completeResponse.text());
      return;
    }
    
    const {location}  : {location: string} = await completeResponse.json();
    if (completionStrategy === 'openidprovider') {
      window.location.href = location;
      return;
    }
    const url = new URL(location);
    const params = searchParamsToPOJO(url.searchParams) as AuthorizeResponse;

    await handleResponse(params, {
      pkce: required.pkce && "code_verifier" in required.pkce ? required.pkce : undefined,
      redirectUri
    });
  }, [completionStrategy, pkce]);

  /**
   * Render QR codes
   */
  useEffect(() => {
    if (!qrCode) return;

    let isSubscribed = true;
    (async () => {
      const width = wrapperRef.current!.offsetWidth;
      const canvas = canvasRef.current!;
      canvas.width = width;
      canvas.height = width;

      const qrImage = await QRCode.toCanvas(qrCode, {
        errorCorrectionLevel: 'low',
        scale: 10,
        width,
        margin: props.qrMargin ?? 4
      });

      if (!isSubscribed) return;
      const context = canvas.getContext('2d')!;
      context.drawImage(qrImage, 0, 0);

      // MAYBE: render bankid logo in QR Code
      // const logoWidth = canvas.width * LOGO_RATIO;
      // const logoHeight = canvas.height * LOGO_RATIO;
      // const logoX = (canvas.width - logoWidth) / 2;
      // const logoY = (canvas.width - logoHeight) / 2;
      // context.fillStyle = "#235971";
      // context.fillRect(logoX -5 , logoY -5, logoWidth + 10, logoHeight + 10)

      // context.drawImage(
      //   logo,
      //   logoX,
      //   logoY,
      //   logoWidth,
      //   logoHeight
      // );
    })();
    
    return () => {
      isSubscribed = false;
    }
  }, [qrCode, props.qrMargin]);

  /**
   * Poll for response
   */
  usePoll(pollUrl, {
    onQrCode: setQrCode,
    onComplete: handleComplete,
    onError: handleError
  });

  return (
    <div ref={wrapperRef}>
      <canvas ref={canvasRef} />
    </div>
  );
}

type UsePollCallbacks = {
  onQrCode: (code: string) => void,
  onComplete: (url: string) => void,
  onError: (error: string) => void
}
export function usePoll(pollUrl: string | null, callback: UsePollCallbacks) {
  const {onQrCode, onComplete, onError} = callback;
  useEffect(() => {
    if (!pollUrl) return;

    const delay = 2500;
    let timeout : any;
    const poll = async () => {
      const response = await fetch(pollUrl);

      if (response.status < 400) {
        const payload = await response.json() as PollResponse;
        if (payload.qrCode) onQrCode(payload.qrCode);
        if (payload.targetUrl) {
          onComplete(payload.targetUrl)
          return;
        }
      }
      else {
        const text = await response.text();
        onError(text);
      }

      if (response.status === 202) {
        timeout = setTimeout(poll, delay);
      }
    };

    timeout = setTimeout(poll, delay);
    return () => clearTimeout(timeout);
  }, [pollUrl, onQrCode, onComplete, onError]);
}