import OpenIDConfiguration from '@criipto/auth-js/dist/OpenID';
import React, { useContext, useEffect, useState } from 'react';
import CriiptoVerifyContext from '../../context';

interface Props {
  acrValues?: string[]
}

export default function AuthMethodSelector(props: Props) {
  const context = useContext(CriiptoVerifyContext);
  const [configuration, setConfiguration] = useState<OpenIDConfiguration | null>(null);

  useEffect(() => {
    (async () => {
      const configuration = await context.fetchOpenIDConfiguration();
      setConfiguration(configuration);
    })();
  }, []);

  return (
    <div>
      {configuration?.acr_values_supported.join(', ')}
    </div>
  )
}