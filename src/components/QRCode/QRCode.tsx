import React, { useContext, useRef, useEffect, useState } from 'react';
import CriiptoVerifyContext from '../../context';

interface Props {
  /*
   * Add a CSS class to all wrapper elements rendered
   * This can be both the QR code wrapper, as well as the "acknowledged" message wrapper
   */
  className?: string
  style?: React.CSSProperties

  /*
   * Add a class specifically to the QR code wrapper
   */
  qrWrapperClassName?: string
  qrWrapperStyle?: React.CSSProperties

  /*
   * An element to render in place of the QR Code when the device has acknowledged the request.
   */
  acknowledgedElement?: React.ReactElement
  acknowledgedWrapperClassName?: string
  acknowledgedWrapperStyle?: React.CSSProperties
}

function mergeClasses(...classes: (string | undefined)[]) : string {
  return classes.reduce((memo, className) => className ? memo + ` ${className}` : memo, '')!;
}

function mergeStyles(...styles: (React.CSSProperties | undefined)[]) : React.CSSProperties {
  return styles.reduce((memo, style) => style ? ({...memo, ...style}) : memo, {})!;
}

export default function QRCode(props: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const {client, buildOptions, handleResponse, pkce} = useContext(CriiptoVerifyContext);
  const [isAcknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
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
      if (promise.cancelled) return;
      console.log(err);
      handleResponse({
        error: err
      }, {});
    });

    return () => {
      promise.cancel();
    };
  }, [buildOptions]);

  if (isAcknowledged) {
    if (props.acknowledgedElement) return props.acknowledgedElement;
    return (
      <div
        className={mergeClasses(props.className, props.acknowledgedWrapperClassName)}
        style={mergeStyles(props.style, props.acknowledgedWrapperStyle)}
      >
        Complete the login process on your phone.
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={mergeClasses(props.className, props.qrWrapperClassName)} 
      style={mergeStyles(props.style, props.qrWrapperStyle)} />
  );
}