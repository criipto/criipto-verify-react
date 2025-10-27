import React, {useContext, useEffect, useState} from 'react';

import './AuthMethodButton/AuthMethodButton.css';
import CriiptoVerifyContext, { Action } from '../context';
import SEBankIDSameDeviceButton from './SEBankIDSameDeviceButton';
import { savePKCEState } from '@criipto/auth-js';
import AuthMethodButtonLogo, {AuthMethodButtonLogoProps} from './AuthMethodButton/Logo';
import { AnchorButton, Button } from './Button';
import { acrValueToTitle, isAmbiguous, isSingle, Language, stringifyAction } from '../utils';
import { AuthButtonGroupContext } from './AuthButtonGroup';

export type PopupParams = {
  acrValue: string,
  onHide: () => void
};
export type PopupOption = boolean | ((options: PopupParams) => boolean | React.ReactElement)

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

  userAgent?: string
}

export default function AuthMethodButton(props: AuthMethodButtonProps) {
  const {acrValue} = props;
  const group = useContext(AuthButtonGroupContext);
  const standalone = !group.multiple || isSingle(props.acrValue, group.acrValues);
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

  const { title, subtitle } = acrValueToTitle(language, acrValue, {disambiguate: isAmbiguous(acrValue, group.acrValues)})
  const contents = props.children ?? (
    <React.Fragment>
      {stringifyAction(language, action) ? `${stringifyAction(language, action)} ` : ''}{title}&nbsp;
      {standalone ? null : lowercaseFirst(subtitle)}
    </React.Fragment>
  )

  const inner = (
    <React.Fragment>
      <AuthMethodButtonLogo acrValue={acrValue} logo={props.logo} />
      <span>{contents}</span>
    </React.Fragment>
  );

  const button = href ? (
    <React.Fragment>
      <AnchorButton {...props} href={href} className={className} onClick={handleClick}>
        {inner}
      </AnchorButton>
      {backdrop}
    </React.Fragment>
  ) : (
    <React.Fragment>
      <Button {...props} className={className} onClick={handleClick}>
        {inner}
      </Button>
      {backdrop}
    </React.Fragment>
  );
  
  if (!props.href && acrValue === 'urn:grn:authn:se:bankid:same-device') {
    return (
      <SEBankIDSameDeviceButton
        redirectUri={props.redirectUri}
        fallback={button}
        className={className}
        userAgent={props.userAgent}
        logo={<AuthMethodButtonLogo acrValue={acrValue} logo={props.logo} />}
      >
        <span>{contents}</span>
      </SEBankIDSameDeviceButton>
    );
  }

  return button;
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
