import React, { useContext, useEffect, useState } from 'react';

import './AuthMethodButton/AuthMethodButton.css';
import CriiptoVerifyContext, { type Action } from '../context';
import SEBankIDSameDeviceButton from './SEBankIDSameDeviceButton';
import { savePKCEState } from '@criipto/auth-js';
import AuthMethodButtonLogo, { type AuthMethodButtonLogoProps } from './AuthMethodButton/Logo';
import { AnchorButton, Button } from './Button';
import { acrValueToTitle, isAmbiguous, isSingle, stringifyAction } from '../utils';
import { AuthButtonGroupContext } from './AuthButtonGroup';
import { type Language } from '../i18n';
import { Spinner } from './Spinner/Spinner';
import classNames from 'classnames';

export type PopupParams = {
  acrValue: string;
  onHide: () => void;
};
export type PopupOption = boolean | ((options: PopupParams) => boolean | React.ReactElement);

export interface AuthMethodButtonComponentProps {
  acrValue: string;
  href?: string;
  onClick?: React.MouseEventHandler;
  children?: React.ReactNode;
  'data-testid'?: string;
  className?: string;
  /**
   * base64 image string, e.x. data:image/png;base64,
   * or a ReactElement
   */
  logo?: AuthMethodButtonLogoProps['logo'];
  /**
   * Impacts the button text rendered if no text is provided via props.children
   */
  language?: Language;
  /**
   * Impacts the button text rendered if no text is provided via props.children
   */
  action?: Action;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Display only components, does no state management and triggers no login flows on it's own
 */
export function AuthMethodButtonComponent(props: AuthMethodButtonComponentProps) {
  const { acrValue, href } = props;
  const group = useContext(AuthButtonGroupContext);
  const standalone = !group.multiple || isSingle(props.acrValue, group.acrValues);
  const language = (props.language ?? 'en') as Language;
  const action = (props.action ?? 'login') as Action;

  const disabled = (props.disabled || group.disabled) && !props.loading;
  const className = classNames(`criipto-eid-btn`, acrValueToClassName(acrValue), props.className, {
    'criipto-eid-btn--disabled': disabled,
    'criipto-eid-btn--loading': props.loading,
  });

  const { title, subtitle } = acrValueToTitle(language, acrValue, {
    disambiguate: isAmbiguous(acrValue, group.acrValues),
  });
  const contents = props.children ?? (
    <React.Fragment>
      {stringifyAction(language, action) ? `${stringifyAction(language, action)} ` : ''}
      {title}&nbsp;
      {standalone ? null : lowercaseFirst(subtitle)}
    </React.Fragment>
  );

  const inner = (
    <React.Fragment>
      <AuthMethodButtonLogo acrValue={acrValue} logo={props.loading ? <Spinner /> : props.logo} />
      <span>{contents}</span>
    </React.Fragment>
  );

  const commonProps = {
    ...props,
    className,
    disabled,
  };
  const button = href ? (
    <React.Fragment>
      <AnchorButton {...commonProps} href={href}>
        {inner}
      </AnchorButton>
    </React.Fragment>
  ) : (
    <React.Fragment>
      <Button {...commonProps}>{inner}</Button>
    </React.Fragment>
  );

  return button;
}

export type AuthMethodButtonContainerProps = AuthMethodButtonComponentProps & {
  redirectUri?: string;
  popup?: PopupOption;

  /**
   * Will ammend the login_hint parameter with `message:{base64(message)}` which will set a login/aprove message where available (Danish MitID).
   */
  message?: string;

  userAgent?: string;
};

export function AuthMethodButtonContainer(props: AuthMethodButtonContainerProps) {
  const { acrValue } = props;
  const group = useContext(AuthButtonGroupContext);
  const standalone = !group.multiple || isSingle(props.acrValue, group.acrValues);
  const context = useContext(CriiptoVerifyContext);
  const { initializePAR } = context;
  const language = (props.language ?? context.uiLocales ?? 'en') as Language;
  const action = (props.action ?? context.action ?? 'login') as Action;
  const className = `criipto-eid-btn ${acrValueToClassName(acrValue)}${
    props.className ? ` ${props.className}` : ''
  }`;
  const [backdrop, setBackdrop] = useState<React.ReactElement | null>(null);
  const [loading, setLoading] = useState<boolean>(props.loading ?? false);
  useEffect(() => {
    setLoading(props.loading ?? false);
  }, [props.loading]);

  const redirectUri = props.redirectUri || context.redirectUri;

  const handleClick: React.MouseEventHandler = (event) => {
    if (props.href) return;

    if (context.pkce && 'code_verifier' in context.pkce) {
      // just-in-time saving of PKCE, in case of man-in-the-browser
      savePKCEState(context.store, {
        response_type: 'id_token',
        pkce_code_verifier: context.pkce.code_verifier,
        redirect_uri: redirectUri!,
      });
    }

    if (props.popup) {
      let willPopup =
        typeof props.popup === 'function'
          ? props.popup({
              acrValue,
              onHide: () => setBackdrop(null),
            })
          : props.popup === true;

      if (willPopup !== false) {
        event.preventDefault();

        if (typeof willPopup === 'boolean') {
          context.loginWithPopup({
            acrValues: [acrValue],
            redirectUri: redirectUri,
            backdrop: true,
          });
        } else {
          setBackdrop(willPopup);
          context.loginWithPopup({
            acrValues: [acrValue],
            redirectUri: redirectUri,
            backdrop: false,
          });
        }
      }
    }

    if (props.onClick) props.onClick(event);

    if (!event.isDefaultPrevented()) {
      setLoading(true);
      group.setDisabled(true);
      initializePAR({
        redirectUri,
        acrValues: acrValue,
        loginHint: '',
      })
        .then((authorizeUrl) => {
          window.location.href = authorizeUrl.toString();
        })
        .catch((error) => {
          setLoading(false);
          group.setDisabled(false);
          context.handleResponse(error);
        });
    }
  };

  const { title, subtitle } = acrValueToTitle(language, acrValue, {
    disambiguate: isAmbiguous(acrValue, group.acrValues),
  });

  const contents = props.children ?? (
    <React.Fragment>
      {stringifyAction(language, action) ? `${stringifyAction(language, action)} ` : ''}
      {title}&nbsp;
      {standalone ? null : lowercaseFirst(subtitle)}
    </React.Fragment>
  );

  const button = (
    <React.Fragment>
      <AuthMethodButtonComponent
        {...props}
        className={className}
        onClick={handleClick}
        loading={loading}
      />
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
        disabled={props.disabled}
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
      return memo.concat([`${memo[memo.length - 1]}-${segment}`]);
    } else {
      return memo.concat([segment]);
    }
  }, []);

  return classNames.map((className) => `criipto-eid-btn--${className}`).join(' ');
}

function lowercaseFirst(input?: string) {
  if (!input) return input;
  return input.substring(0, 1).toLowerCase() + input.substr(1, input.length);
}
