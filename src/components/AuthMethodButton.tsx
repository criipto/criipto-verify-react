import React, {useContext, useEffect, useState} from 'react';

import beeid from './AuthMethodButton/logos/beeid@2x.png';
import digid from './AuthMethodButton/logos/nldigid@2x.png';
import dkmitid from './AuthMethodButton/logos/dkmitid@2x.png';
import dknemid from './AuthMethodButton/logos/dknemid@2x.png';
import ftnmobile from './AuthMethodButton/logos/ftnmobile@2x.png';
import ftnbankid from './AuthMethodButton/logos/ftnbankid@2x.png';
import itsme from './AuthMethodButton/logos/itsme@2x.png';
import nobankid from './AuthMethodButton/logos/nobankid@2x.png';
import novipps from './AuthMethodButton/logos/novipps@2x.png';
import sebankid from './AuthMethodButton/logos/sebankid@2x.png';
import sofort from './AuthMethodButton/logos/sofort@2x.png';

import './AuthMethodButton/AuthMethodButton.css';
import { getMobileOS } from '../device';
import CriiptoVerifyContext from '..//context';
import SEBankIDSameDeviceButton from './SEBankIDSameDeviceButton';
import { savePKCEState } from '@criipto/auth-js';

export type PopupParams = {
  acrValue: string,
  onHide: () => void
};
export type PopupOption = boolean | ((options: PopupParams) => boolean | React.ReactElement)

interface ButtonProps {
  className?: string,
  children: React.ReactNode,
  onClick?: React.MouseEventHandler,
}

interface AnchorButtonProps extends ButtonProps {
  href: string
}

const mobileOS = getMobileOS();

export function AnchorButton(props: AnchorButtonProps) {
  return (
    <a className={`criipto-verify-button ${props.className}`} href={props.href} onClick={props.onClick}>{props.children}</a>
  );
}

export function Button(props: ButtonProps) {
  return (
    <button className={`criipto-verify-button ${props.className}`} type="button"  onClick={props.onClick}>{props.children}</button>
  );
}

export interface AuthMethodButtonProps {
  acrValue: string,
  href?: string;
  onClick?: React.MouseEventHandler,
  children?: React.ReactNode,
  'data-testid'?: string,
  className?: string,
  redirectUri?: string,
  popup?: PopupOption,
  /**
   * base64 image string, e.x. data:image/png;base64,
   * or a ReactElement
   */
  logo?: React.ReactElement | string
}

export default function AuthMethodButton(props: AuthMethodButtonProps) {
  const {acrValue} = props;
  const context = useContext(CriiptoVerifyContext);
  const className = `criipto-eid-btn ${acrValueToClassName(acrValue)}${props.className ? ` ${props.className}` : ''}`;
  const [backdrop, setBackdrop] = useState<React.ReactElement | null>(null);

  const [href, setHref] = useState(props.href);
  const redirectUri = props.redirectUri || context.redirectUri;

  useEffect(() => {
    if (props.href) return;

    let isSubscribed = true;
    let loginHint : string | undefined = undefined;

    if (acrValue.startsWith('urn:grn:authn:dk:mitid') && mobileOS) {
      loginHint = `appswitch:${mobileOS} target:web`;
    }

    context.buildAuthorizeUrl({
      redirectUri,
      acrValues: acrValue,
      loginHint
    }).then(href => {
      if (isSubscribed) setHref(href);
    })
    .catch(console.error);

    return () => {
      isSubscribed = false;
    };
  }, [props.href, acrValue, context.pkce, redirectUri]);

  const handleClick : React.MouseEventHandler = (event) => {
    if (context.pkce && "code_verifier" in context.pkce) {
      // just-in-time saving of PKCE, in case of man-in-the-browser
      savePKCEState(context.store, {
        response_type: 'id_token',
        pkce_code_verifier: context.pkce.code_verifier,
        redirect_uri: redirectUri!
      });
    }

    if (props.popup) {
      let willPopup =
        typeof props.popup === "function" ?
          props.popup({
            acrValue,
            onHide: () => setBackdrop(null)
          }) :
          props.popup === true;

      if (willPopup !== false) {
        event.preventDefault();

        if (typeof willPopup === "boolean") {
          context.loginWithPopup({
            acrValues: [acrValue],
            redirectUri: redirectUri,
            backdrop: true
          }); 
        } else {
          setBackdrop(willPopup);
          context.loginWithPopup({
            acrValues: [acrValue],
            redirectUri: redirectUri,
            backdrop: false
          }); 
        }
      }
    }

    if (props.onClick) props.onClick(event);
  }

  const logo =
    typeof props.logo === "string" ? <img src={props.logo} alt="" /> :
    props.logo ?? (acrValueToLogo(acrValue) ? <img src={acrValueToLogo(acrValue)} alt="" /> : null);

  if (acrValue === 'urn:grn:authn:se:bankid:same-device') {
    return (
      <SEBankIDSameDeviceButton
        redirectUri={props.redirectUri}
        href={href}
        className={className}
        logo={logo}
      >
        {props.children}
      </SEBankIDSameDeviceButton>
    );
  }

  const inner = (
    <React.Fragment>
      {logo ? (
        <div className="criipto-eid-logo">
          {logo}
        </div>
      ) : null}
      {props.children}
    </React.Fragment>
  );

  if (href) {
    return (
      <React.Fragment>
        <AnchorButton {...props} href={href} className={className} onClick={handleClick}>
          {inner}
        </AnchorButton>
        {backdrop}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Button {...props} className={className} onClick={handleClick}>
        {inner}
      </Button>
      {backdrop}
    </React.Fragment>
  );
}

function acrValueToClassName(value: string) {
  value = value.replace('urn:grn:authn:', '');
  const segments = value.split(':');
  const classNames = segments.reduce((memo: string[], segment: string) => {
    if (memo.length) {
      return memo.concat([`${memo[memo.length-1]}-${segment}`])
    } else {
      return memo.concat([segment]);
    }
  }, []);

  return classNames.map(className => `criipto-eid-btn--${className}`).join(' ');
}

function acrValueToLogo(value : string) {
  if (value.startsWith('urn:grn:authn:be:eid')) {
    return beeid;
  }
  if (value.startsWith('urn:grn:authn:nl:digid')) {
    return digid;
  }
  if (value.startsWith('urn:grn:authn:dk:mitid')) {
    return dkmitid;
  }
  if (value.startsWith('urn:grn:authn:dk:nemid')) {
    return dknemid;
  }
  if (value.startsWith('urn:grn:authn:fi:bank-id')) {
    return ftnbankid;
  }
  if (value.startsWith('urn:grn:authn:fi')) {
    return ftnmobile;
  }
  if (value.startsWith('urn:grn:authn:itsme')) {
    return itsme;
  }
  if (value.startsWith('urn:grn:authn:se:bankid')) {
    return sebankid;
  }
  if (value.startsWith('urn:grn:authn:de:sofort')) {
    return sofort;
  }
  if (value.startsWith('urn:grn:authn:no:bankid')) {
    return nobankid;
  }
  if (value.startsWith('urn:grn:authn:no:vipps')) {
    return novipps;
  }
}