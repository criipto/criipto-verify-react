import React, {useContext, useEffect, useState} from 'react';

import './AuthMethodButton/AuthMethodButton.css';
import { getMobileOS } from '../device';
import CriiptoVerifyContext, { Action } from '../context';
import SEBankIDSameDeviceButton from './SEBankIDSameDeviceButton';
import { savePKCEState } from '@criipto/auth-js';
import AuthMethodButtonLogo, {AuthMethodButtonLogoProps} from './AuthMethodButton/Logo';
import { AnchorButton, Button } from './Button';
import { acrValueToTitle, Language, stringifyAction } from '../utils';
import { MESSAGE_SUPPORTING_ACR_VALUES } from '../provider';

export type PopupParams = {
  acrValue: string,
  onHide: () => void
};
export type PopupOption = boolean | ((options: PopupParams) => boolean | React.ReactElement)

const mobileOS = getMobileOS();

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
  logo?: AuthMethodButtonLogoProps["logo"],

  /**
   * if the button is rendered alone or as part of a group of other auth method buttons
   * will have an impact on what default text is rendered inside the button (if none is provided)
   * i.e. Login with BankID with qrcode vs Login with BankID
   */
  standalone?: boolean,
  /**
   * Impacts the button text rendered if no text is provided via props.children
   */
  language?: Language,
  /**
   * Impacts the button text rendered if no text is provided via props.children
   */
  action?: Action
  /**
   * Will ammend the login_hint parameter with `message:{base64(message)}` which will set a login/aprove message where available (Danish MitID).
   */
  message?: string
}

export default function AuthMethodButton(props: AuthMethodButtonProps) {
  const {acrValue, standalone} = props;
  const context = useContext(CriiptoVerifyContext);
  const {buildAuthorizeUrl} = context;
  const language = (props.language ?? context.uiLocales ?? 'en') as Language;
  const action = (props.action ?? context.action ?? 'login') as Action;
  const message = props.message ?? context.message;
  const className = `criipto-eid-btn ${acrValueToClassName(acrValue)}${props.className ? ` ${props.className}` : ''}`;
  const [backdrop, setBackdrop] = useState<React.ReactElement | null>(null);

  const [href, setHref] = useState(props.href);
  const redirectUri = props.redirectUri || context.redirectUri;

  useEffect(() => {
    if (props.href) return;

    let isSubscribed = true;
    let loginHint : string | undefined = undefined;

    if (acrValue.startsWith('urn:grn:authn:dk:mitid')) {
      if (mobileOS) {
        loginHint = `appswitch:${mobileOS} target:web`; 
      }
    }

    buildAuthorizeUrl({
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
  }, [props.href, buildAuthorizeUrl, acrValue, context.pkce, redirectUri]);

  const handleClick : React.MouseEventHandler = (event) => {
    if (props.href) return;

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

  const contents = props.children ?? (
    <React.Fragment>
      {stringifyAction(language, action) ? `${stringifyAction(language, action)} ` : ''}{acrValueToTitle(language, acrValue).title}&nbsp;
      {standalone ? null : lowercaseFirst(acrValueToTitle(language, acrValue).subtitle)}
    </React.Fragment>
  )
  
  if (!props.href && acrValue === 'urn:grn:authn:se:bankid:same-device') {
    return (
      <SEBankIDSameDeviceButton
        redirectUri={props.redirectUri}
        href={href}
        className={className}
        logo={<AuthMethodButtonLogo acrValue={acrValue} logo={props.logo} />}
      >
        {contents}
      </SEBankIDSameDeviceButton>
    );
  }

  const inner = (
    <React.Fragment>
      <AuthMethodButtonLogo acrValue={acrValue} logo={props.logo} />
      {contents}
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

function lowercaseFirst(input?: string) {
  if (!input) return input;
  return input.substring(0, 1).toLowerCase() + input.substr(1, input.length);
}
