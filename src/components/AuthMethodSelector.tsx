import {OpenIDConfiguration} from '@criipto/auth-js';
import React, { useContext, useEffect, useState } from 'react';
import CriiptoVerifyContext from '../context';
import { filterAcrValues, Language, acrValueToProviderPrefix } from '../utils';
import AuthMethodButton, {AuthMethodButtonProps} from './AuthMethodButton';

import './AuthMethodSelector/AuthMethodSelector.css';
import SEBankIDQrCode from './SEBankIDQRCode';

interface AuthMethodSelectorProps {
  acrValues?: string[],
  language?: Language,
  onSelect?: (acrValue: string) => void,
  redirectUri?: string,
  popup?: AuthMethodButtonProps["popup"]
}

function isSingle(acrValue: string, acrValues: string[]) {
  const provider = acrValueToProviderPrefix(acrValue);
  const count = acrValues.reduce((memo, acrValue) => memo + (acrValueToProviderPrefix(acrValue) === provider ? 1 : 0), 0);
  return count === 1;
}

export default function AuthMethodSelector(props: AuthMethodSelectorProps) {
  const {fetchOpenIDConfiguration, action, uiLocales} = useContext(CriiptoVerifyContext);
  const language = props.language || uiLocales as Language || 'en';
  const [configuration, setConfiguration] = useState<OpenIDConfiguration | null>(null);

  useEffect(() => {
    if (props.acrValues) return;

    let isSubscribed = true;
    (async () => {
      const configuration = await fetchOpenIDConfiguration();
      if (isSubscribed) setConfiguration(configuration);
    })();

    return () => {
      isSubscribed = false;
    };
  }, [props.acrValues]);

  const acrValues = filterAcrValues(props.acrValues ?? configuration?.acr_values_supported ?? []);
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
        />
      ))}
      {hasQR ? (
        <SEBankIDQrCode language={language} redirectUri={props.redirectUri} />
      ) : null}
    </div>
  )
}