import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { AuthorizeResponse, OAuth2Error, PKCE } from '@criipto/auth-js';
import QRCode from 'qrcode';
import { type Language } from '../i18n';

import CriiptoVerifyContext from '../context';

import logo from './SEBankIDQRCode/logo@2x.png';
import './SEBankIDQRCode/SEBankIDQRCode.css';
import { getI18n } from '../i18n';

interface Props {
  redirectUri?: string;
  qrMargin?: number;
  /**
   * Impacts the help text
   */
  language?: Language;
  children?: (props: {
    qrElement: React.ReactElement;
    /**
     * Can be rendered instead of `qrElement` if you only wish to render the qr code with no additional content.
     * Combine with `qrMargin`.
     */
    imageElement: React.ReactElement;
    /**
     * Will be true once the user has completed login in the app and the rest of the login flow is being processed
     */
    isCompleting: boolean;
    /**
     * The user has clicked on the qr image element to trigger fullscreen view per https://developers.bankid.com/getting-started/qr-code#accessibility
     */
    fullscreen: boolean;
    error: OAuth2Error | Error | null;
    retry: () => void;
  }) => React.ReactElement;

  /** Render fallback element while loading */
  fallback?: React.ReactElement;
}

interface QrResponse {
  initialQrCode: string;
  pollUrl: string;
}
interface PollResponse {
  qrCode?: string;
  targetUrl?: string;
}

function searchParamsToPOJO(input: URLSearchParams) {
  return Array.from(input.keys()).reduce((memo: { [key: string]: string }, key) => {
    memo[key] = input.get(key)!;
    return memo;
  }, {});
}

export default function SEBankIDQrCode(props: Props) {
  const wrapperRef = useRef<HTMLButtonElement>(null);
  const {
    buildAuthorizeUrl,
    completionStrategy,
    handleResponse,
    generatePKCE,
    redirectUri: defaultRedirectURi,
    uiLocales,
  } = useContext(CriiptoVerifyContext);
  const language = (props.language ?? uiLocales ?? 'en') as Language;
  const redirectUri = props.redirectUri || defaultRedirectURi;
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pollUrl, setPollUrl] = useState<string | null>(null);
  const [error, setError] = useState<OAuth2Error | Error | null>(null);
  const [pkce, setPKCE] = useState<PKCE | undefined>(undefined);
  const [isCompleting, setCompleting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    setQrCode(null);
    setPollUrl(null);
    setPKCE(undefined);

    const pkce = await generatePKCE();

    buildAuthorizeUrl({
      acrValues: 'urn:grn:authn:se:bankid:another-device:qr',
      responseMode: 'json',
      pkce,
      redirectUri,
      prompt: 'login', // Triggering SSO at this point would be a mistake
    })
      .then((url) => {
        return fetch(url).then((response) => response.json() as Promise<QrResponse>);
      })
      .then((response) => {
        setPKCE(pkce);
        setQrCode(response.initialQrCode);
        setPollUrl(response.pollUrl);
      })
      .catch(console.error);
  }, [buildAuthorizeUrl, redirectUri]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRetry = () => {
    setCompleting(false);
    refresh();
  };

  const handleError = useCallback(
    (error: string) => {
      /* Timeout error */
      if (error === 'Collect failed: startFailed' || error === '"Collect failed: startFailed"') {
        handleRetry();
        return;
      }
      setError(new Error(error));
      handleResponse(new Error(error), {
        pkce,
        redirectUri,
        source: 'SEBankIDQrCode',
      });
    },
    [pkce, redirectUri],
  );

  const handleComplete = useCallback(
    async (completeUrl: string) => {
      setCompleting(true);
      const required = { pkce };
      const parsed = await parseCompleteUrl(completeUrl);

      if (parsed instanceof Error) {
        return handleError(parsed.message);
      }

      const { location, response } = parsed;

      if (completionStrategy === 'openidprovider') {
        window.location.href = location;
        return;
      }
      await handleResponse(response, {
        pkce: required.pkce,
        redirectUri,
        source: 'SEBankIDQrCode',
      });
    },
    [completionStrategy, pkce],
  );

  /**
   * Render QR codes
   */
  const qrDataURL = useDraw(qrCode, {
    width: fullscreen
      ? (window.innerHeight ?? wrapperRef.current?.offsetWidth)
      : wrapperRef.current?.offsetWidth,
    // 2 is half of the default 4, less margin is required in fullscreen
    qrMargin: props.qrMargin ?? (fullscreen ? 2 : undefined),
  });

  /**
   * Poll for response
   */
  usePoll(pollUrl, {
    enabled: !isCompleting,
    onQrCode: setQrCode,
    onComplete: handleComplete,
    onError: handleError,
  });

  const i18n = getI18n(language);

  const imageElement = (
    <button
      aria-label={i18n.thisIsTheQR}
      ref={wrapperRef}
      className="criipto-se-bankid-qr-canvas"
      onClick={() => setFullscreen((val) => !val)}
    >
      {qrDataURL ? <img src={qrDataURL} /> : null}
    </button>
  );

  const qrElement = (
    <div className="criipto-se-bankid-qr">
      <aside className="criipto-se-bankid-qr--help-text">
        {isCompleting ? i18n.completingLogin : i18n.openAndScan}
        <img src={logo} />
      </aside>

      {imageElement}
    </div>
  );

  if (!qrCode && props.fallback) {
    return props.fallback;
  }

  if (props.children) {
    return props.children({
      qrElement,
      imageElement,
      error,
      isCompleting,
      retry: () => handleRetry(),
      fullscreen,
    });
  }

  if (fullscreen) {
    return (
      <dialog className="criipto-se-bankid-qr-fullscreen" open>
        {imageElement}
      </dialog>
    );
  }

  return qrElement;
}

SEBankIDQrCode.acr_values = 'urn:grn:authn:se:bankid:another-device:qr';

type UseDrawOptions = {
  width?: number;
  qrMargin?: number;
};
export function useDraw(qrCode: string | null, options: UseDrawOptions) {
  const { width, qrMargin } = options;
  const [dataURL, setDataURL] = useState<string | null>(null);

  useEffect(() => {
    if (!qrCode) return;

    let isSubscribed = true;
    (async () => {
      const qrImage = await QRCode.toDataURL(qrCode, {
        errorCorrectionLevel: 'low',
        scale: 10,
        width,
        margin: qrMargin ?? 4,
      });

      if (!isSubscribed) return;
      setDataURL(qrImage);
    })();

    return () => {
      isSubscribed = false;
    };
  }, [qrCode, qrMargin, width]);

  return dataURL;
}

type UsePollOptions = {
  enabled: boolean;
  onQrCode: (code: string) => void;
  onComplete: (url: string) => void;
  onError: (error: string) => void;
};
export function usePoll(pollUrl: string | null, options: UsePollOptions) {
  const { onQrCode, onComplete, onError, enabled } = options;
  useEffect(() => {
    if (!pollUrl) return;
    if (!enabled) return;

    const delay = 2500;
    let timeout: any;
    let isSubscribed = true;
    const poll = async () => {
      if (!isSubscribed) return;
      const response = await fetch(pollUrl);

      if (!isSubscribed) return;
      if (response.status < 400) {
        const payload = (await response.json()) as PollResponse;
        if (payload.qrCode) onQrCode(payload.qrCode);
        if (payload.targetUrl) {
          onComplete(payload.targetUrl);
          return;
        }
      } else {
        const text = await response.text();
        onError(text);
      }

      if (response.status === 202) {
        timeout = setTimeout(poll, delay);
      }
    };

    timeout = setTimeout(poll, delay);
    return () => {
      isSubscribed = false;
      clearTimeout(timeout);
    };
  }, [pollUrl, onQrCode, onComplete, onError, enabled]);
}

export async function parseCompleteUrl(
  completeUrl: string,
): Promise<{ location: string; response: AuthorizeResponse } | Error> {
  /**
   * Handle verify response inconsistencies
   */
  if (completeUrl.includes('error=')) {
    const url = new URL(completeUrl);
    const completeParams = searchParamsToPOJO(url.searchParams) as AuthorizeResponse;

    return { location: completeUrl, response: completeParams };
  }

  const completeResponse = await fetch(completeUrl);
  if (completeResponse.status >= 400) {
    return new Error(await completeResponse.text());
  }

  const { location }: { location: string } = await completeResponse.json();
  const url = new URL(location);
  const params = searchParamsToPOJO(url.searchParams) as AuthorizeResponse;
  return { location: location, response: params };
}
