import {OpenIDConfiguration} from '@criipto/auth-js';
import React, { useContext, useEffect, useState } from 'react';
import CriiptoVerifyContext from '../../context';
import { acrValueToTitle, filterAcrValues, Language } from '../../utils';
import AuthMethodButton from '../AuthMethodButton/AuthMethodButton';

interface Props {
  acrValues?: string[],
  language?: Language,
  onSelect?: (acrValue: string) => void,
  redirectUri?: string
}

export default function AuthMethodSelector(props: Props) {
  const context = useContext(CriiptoVerifyContext);
  const language = props.language || 'en';
  const [configuration, setConfiguration] = useState<OpenIDConfiguration | null>(null);

  useEffect(() => {
    (async () => {
      const configuration = await context.fetchOpenIDConfiguration();
      setConfiguration(configuration);
    })();
  }, []);

  const acrValues = filterAcrValues(props.acrValues ?? configuration?.acr_values_supported ?? []);

  return (
    <React.Fragment>
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
    </React.Fragment>
  )
}