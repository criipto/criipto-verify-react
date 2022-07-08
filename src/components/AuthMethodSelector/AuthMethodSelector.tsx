import {OpenIDConfiguration} from '@criipto/auth-js';
import React, { useContext, useEffect, useState } from 'react';
import CriiptoVerifyContext from '../../context';
import { acrValueToTitle, filterAcrValues, Language } from '../../utils';
import AuthMethodButton from '../AuthMethodButton/AuthMethodButton';

import './AuthMethodSelector.css';

interface Props {
  acrValues?: string[],
  language?: Language,
  onSelect?: (acrValue: string) => void,
  redirectUri?: string
}

export default function AuthMethodSelector(props: Props) {
  const {fetchOpenIDConfiguration} = useContext(CriiptoVerifyContext);
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
          {acrValueToTitle(language, acrValue).title}<br />
          {acrValueToTitle(language, acrValue).subtitle}
        </AuthMethodButton>
      ))}
    </div>
  )
}