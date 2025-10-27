import { OpenIDConfiguration } from '@criipto/auth-js';
import React, { useContext, useEffect, useState } from 'react';
import CriiptoVerifyContext from '../context';
import { getUserAgent } from '../device';
import { filterAcrValues, Language, acrValueToProviderPrefix } from '../utils';
import AuthMethodButton, { AuthMethodButtonProps } from './AuthMethodButton';

import './AuthMethodSelector/AuthMethodSelector.css';
import SEBankIDQrCode from './SEBankIDQRCode';
import AuthButtonGroup from './AuthButtonGroup';

interface AuthMethodSelectorProps {
  acrValues?: string[];
  language?: Language;
  onSelect?: (acrValue: string) => void;
  redirectUri?: string;
  popup?: AuthMethodButtonProps['popup'];
  userAgent?: string;
}

export default function AuthMethodSelector(props: AuthMethodSelectorProps) {
  const { action, uiLocales, acrValues: configurationAcrValues } = useContext(CriiptoVerifyContext);
  const language = props.language || (uiLocales as Language) || 'en';

  const acrValues = filterAcrValues(props.acrValues ?? configurationAcrValues ?? []);
  const onlySweden =
    !!acrValues.length && acrValues.every((s) => s.startsWith('urn:grn:authn:se:bankid:'));

  if (onlySweden) {
    return <Sweden {...props} acrValues={acrValues} />;
  }

  return (
    <div className="criipto-eid-selector">
      <AuthButtonGroup>
        {acrValues.map((acrValue) => (
          <AuthMethodButton
            acrValue={acrValue}
            key={acrValue}
            onClick={props.onSelect ? () => props.onSelect!(acrValue) : undefined}
            redirectUri={props.redirectUri}
            popup={props.popup}
            language={language}
            action={action}
            userAgent={props.userAgent}
          />
        ))}
      </AuthButtonGroup>
    </div>
  );
}

type SwedenProps = Omit<AuthMethodSelectorProps, 'acrValues'> & {
  acrValues: string[];
};

export function Sweden(props: SwedenProps) {
  const { acrValues } = props;
  const { action, uiLocales } = useContext(CriiptoVerifyContext);
  const language = props.language || (uiLocales as Language) || 'en';
  const hasQR = acrValues.includes(SEBankIDQrCode.acr_values);
  const filteredAcrValues = acrValues.filter((s) => s !== SEBankIDQrCode.acr_values);

  const userAgent = getUserAgent(
    typeof navigator !== 'undefined' ? navigator.userAgent : props.userAgent,
  );
  const mobileOS =
    userAgent?.os.name === 'iOS' ? 'iOS' : userAgent?.os.name === 'Android' ? 'android' : null;
  const showQR = hasQR && !mobileOS;

  return (
    <div className="criipto-eid-selector">
      <AuthButtonGroup>
        {filteredAcrValues.map((acrValue) => (
          <AuthMethodButton
            acrValue={acrValue}
            key={acrValue}
            onClick={props.onSelect ? () => props.onSelect!(acrValue) : undefined}
            redirectUri={props.redirectUri}
            popup={props.popup}
            language={language}
            action={action}
            userAgent={props.userAgent}
          />
        ))}
        {showQR ? (
          <SEBankIDQrCode
            language={language}
            redirectUri={props.redirectUri}
            fallback={
              <AuthMethodButton
                acrValue={SEBankIDQrCode.acr_values}
                popup={props.popup}
                language={language}
                action={action}
                userAgent={props.userAgent}
              />
            }
          />
        ) : hasQR && mobileOS ? (
          <AuthMethodButton
            acrValue={SEBankIDQrCode.acr_values}
            redirectUri={props.redirectUri}
            popup={props.popup}
            language={language}
            action={action}
            userAgent={props.userAgent}
          />
        ) : null}
      </AuthButtonGroup>
    </div>
  );
}
