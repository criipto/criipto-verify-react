import React from 'react';

import CriiptoVerifyProvider from '../provider';
import AuthMethodSelector from '../components/AuthMethodSelector';
import useCriiptoVerify from '../use-criipto-verify';
import { parseAuthorizeParamsFromUrl } from '@criipto/auth-js';
import { VerifyRuntimeProvider } from '../verify-host-context';

export default {
  title: 'VerifyHostContext',
  argTypes: {
    authorizeURL: {
      name: 'Authorize URL',
      control: 'input'
    }
  }
}

const Template = (args: {authorizeURL: string}) => {
  const params = parseAuthorizeParamsFromUrl(args.authorizeURL);
  return (
    <VerifyRuntimeProvider url={args.authorizeURL}>
      <CriiptoVerifyProvider 
        domain={params.domain}
        clientID={params.clientID}
      >
        <AuthMethodSelector />
      </CriiptoVerifyProvider>
    </VerifyRuntimeProvider>
  );
};

export const IdTokenFragment = Template.bind({});
IdTokenFragment.args = {
  authorizeURL: 'https://samples.criipto.io/oauth2/authorize?scope=openid&client_id=urn:criipto:samples:criipto-verify-react&redirect_uri=https://jwt.io/&response_type=id_token&response_mode=fragment&nonce=ecnon&state=etats'
};

export const CodeQuery = Template.bind({});
CodeQuery.args = {
  authorizeURL: 'https://samples.criipto.io/oauth2/authorize?scope=openid&client_id=urn:criipto:samples:criipto-verify-react&redirect_uri=https://jwt.io/&response_type=code&response_mode=query&nonce=ecnon&state=etats'
};

export const PKCEQuery = Template.bind({});
PKCEQuery.args = {
  authorizeURL: 'https://samples.criipto.io/oauth2/authorize?scope=openid&client_id=urn:criipto:samples:criipto-verify-react&redirect_uri=https://jwt.io/&response_type=code&response_mode=query&nonce=ecnon&state=etats&code_challenge=asd&code_challenge_method=S256'
};