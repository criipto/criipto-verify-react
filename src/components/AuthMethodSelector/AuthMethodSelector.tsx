import {OpenIDConfiguration} from '@criipto/auth-js';
import React, { useContext, useEffect, useState } from 'react';
import CriiptoVerifyContext from '../../context';
import { acrValueToTitle, filterAcrValues, Language, stringifyAction, acrValueToProviderPrefix } from '../../utils';
import AuthMethodButton from '../AuthMethodButton/AuthMethodButton';

import './AuthMethodSelector.css';

interface Props {
  acrValues?: string[],
  language?: Language,
  onSelect?: (acrValue: string) => void,
  redirectUri?: string
}

function lowercaseFirst(input?: string) {
  if (!input) return input;
  return input.substring(0, 1).toLowerCase() + input.substr(1, input.length);
}

function isSingle(acrValue: string, acrValues: string[]) {
  const provider = acrValueToProviderPrefix(acrValue);
  const count = acrValues.reduce((memo, acrValue) => memo + (acrValueToProviderPrefix(acrValue) === provider ? 1 : 0), 0);
  return count === 1;
}

export default function AuthMethodSelector(props: Props) {
  const {fetchOpenIDConfiguration, action} = useContext(CriiptoVerifyContext);
  const language = props.language || 'en';
  const [configuration, setConfiguration] = useState<OpenIDConfiguration | null>(null);

  useEffect(() => {
    if (props.acrValues) return;

    (async () => {
      setConfiguration(await fetchOpenIDConfiguration());
    })();
  }, [props.acrValues]);

  const acrValues = filterAcrValues(props.acrValues ?? configuration?.acr_values_supported ?? []);

  return (
    <div className="criipto-eid-selector">
      {acrValues.map(acrValue => (
        <AuthMethodButton
          acrValue={acrValue}
          key={acrValue}
          onClick={props.onSelect ? (() => props.onSelect!(acrValue)) : undefined}
          redirectUri={props.redirectUri}
        >
          {stringifyAction(language, action) ? `${stringifyAction(language, action)} ` : ''}{acrValueToTitle(language, acrValue).title}&nbsp;
          {isSingle(acrValue, acrValues) ? null : lowercaseFirst(acrValueToTitle(language, acrValue).subtitle)}
        </AuthMethodButton>
      ))}
    </div>
  )
}