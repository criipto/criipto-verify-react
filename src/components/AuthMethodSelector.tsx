import {OpenIDConfiguration} from '@criipto/auth-js';
import React, { useContext, useEffect, useState } from 'react';
import CriiptoVerifyContext from '../context';
import { getUserAgent } from '../device';
import { filterAcrValues, Language, acrValueToProviderPrefix } from '../utils';
import AuthMethodButton, {AuthMethodButtonProps} from './AuthMethodButton';

import './AuthMethodSelector/AuthMethodSelector.css';
import SEBankIDQrCode from './SEBankIDQRCode';

interface AuthMethodSelectorProps {
  acrValues?: string[],
  language?: Language,
  onSelect?: (acrValue: string) => void,
  redirectUri?: string,
  popup?: AuthMethodButtonProps["popup"],
  userAgent?: string
}

function isSingle(acrValue: string, acrValues: string[]) {
  const provider = acrValueToProviderPrefix(acrValue);
  const count = acrValues.reduce((memo, acrValue) => memo + (acrValueToProviderPrefix(acrValue) === provider ? 1 : 0), 0);
  return count === 1;
}

export default function AuthMethodSelector(props: AuthMethodSelectorProps) {
  const {action, uiLocales, acrValues: configurationAcrValues} = useContext(CriiptoVerifyContext);
  const language = props.language || uiLocales as Language || 'en';

  const acrValues = filterAcrValues(props.acrValues ?? configurationAcrValues ?? []);
  const onlySweden = !!acrValues.length && acrValues.every(s => s.startsWith('urn:grn:authn:se:bankid:'));
  
  if (onlySweden) {
    return <Sweden {...props} acrValues={acrValues} />
  }

  return (
    <div className="criipto-eid-selector">
      {acrValues.map(acrValue => (
        <AuthMethodButton
          acrValue={acrValue}
          key={acrValue}
          onClick={props.onSelect ? (() => props.onSelect!(acrValue)) : undefined}
          redirectUri={props.redirectUri}
          popup={props.popup}
          language={language}
          action={action}
          standalone={isSingle(acrValue, acrValues)}
          userAgent={props.userAgent}
        />
      ))}
    </div>
  )
}

type SwedenProps = Omit<AuthMethodSelectorProps, 'acrValues'> & {
  acrValues: string[]
}

export function Sweden(props: SwedenProps) {
  const {acrValues} = props;
  const {action, uiLocales} = useContext(CriiptoVerifyContext);
  const language = props.language || uiLocales as Language || 'en';
  const hasQR = acrValues.includes('urn:grn:authn:se:bankid:another-device:qr');
  const filteredAcrValues = acrValues.filter(s => s !== 'urn:grn:authn:se:bankid:another-device:qr');

  const userAgent = getUserAgent(typeof navigator !== 'undefined' ? navigator.userAgent : props.userAgent);
  const mobileOS = userAgent?.os.name === 'iOS' ? 'iOS' : userAgent?.os.name === 'Android' ? 'android' : null;

  return (
    <div className="criipto-eid-selector">
      {filteredAcrValues.map(acrValue => (
        <AuthMethodButton
          acrValue={acrValue}
          key={acrValue}
          onClick={props.onSelect ? (() => props.onSelect!(acrValue)) : undefined}
          redirectUri={props.redirectUri}
          popup={props.popup}
          language={language}
          action={action}
          standalone={isSingle(acrValue, acrValues)}
          userAgent={props.userAgent}
        />
      ))}
      {(hasQR && !mobileOS) ? (
        <SEBankIDQrCode language={language} redirectUri={props.redirectUri} />
      ) : null}
    </div>
  )
}