import React, { useEffect } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import '../index.css';
import CriiptoVerifyProvider from '../provider';
import StoryResponseRenderer from './StoryResponseRenderer';
import useCriiptoVerify from '../use-criipto-verify';

const ALL_ACR_VALUES = [
  'urn:grn:authn:be:eid:verified',
  'urn:grn:authn:de:sofort',
  'urn:grn:authn:dk:mitid:high',
  'urn:grn:authn:dk:mitid:low',
  'urn:grn:authn:dk:mitid:substantial',
  'urn:grn:authn:dk:nemid:moces',
  'urn:grn:authn:dk:nemid:moces:codefile',
  'urn:grn:authn:dk:nemid:poces',
  'urn:grn:authn:fi:all',
  'urn:grn:authn:fi:bank-id',
  'urn:grn:authn:fi:mobile-id',
  'urn:grn:authn:itsme:advanced',
  'urn:grn:authn:itsme:basic',
  'urn:grn:authn:nl:digid:basic',
  'urn:grn:authn:nl:digid:high',
  'urn:grn:authn:nl:digid:middle',
  'urn:grn:authn:nl:digid:substantial',
  'urn:grn:authn:no:bankid',
  'urn:grn:authn:no:bankid:central',
  'urn:grn:authn:no:bankid:mobile',
  'urn:grn:authn:no:bankid:substantial',
  'urn:grn:authn:no:vipps',
  'urn:grn:authn:se:bankid:another-device:qr',
  'urn:grn:authn:se:bankid:same-device'
];

export default {
  title: 'Methods',
  argTypes: {
    action: {
      name: 'Action',
      control: 'select',
      defaultValue: 'login',
      options: ['confirm', 'accept', 'approve', 'sign', 'login']
    },
    acrValues: {
      options: ALL_ACR_VALUES,
      control: { type: 'multi-select' },
      defaultValue: ALL_ACR_VALUES
    },
    response: {
      name: 'Response mode',
      control: 'select',
      defaultValue: 'token',
      options: ['token', 'code']
    },
    state: {
      name: 'state',
      control: 'text'
    }
  }
};

function LoginWithRedirectButton(props: any) {
  const {loginWithRedirect, isLoading, isInitializing, result} = useCriiptoVerify();
  useEffect(() => {
    if (!props.instant) return;
    if (result) return;
    if (isLoading) return;
    if (isInitializing) return;
    loginWithRedirect();
  }, [props.instant, result, isLoading, isInitializing]);

  return <button onClick={() => loginWithRedirect({acrValues: props.acrValues})}>loginWithRedirect</button>
}

const LoginWithRedirectTemplate = (args: any, {globals} : any) => {
  return (
    <CriiptoVerifyProvider
      action={args.action}
      domain={globals.domain}
      clientID={globals.clientID}
      response={args.response}
      redirectUri={window.location.origin + window.location.pathname + window.location.search}
      prompt="login"
      state={args.state}
    >
      <StoryResponseRenderer>
        <LoginWithRedirectButton acrValues={args.acrValues} instant={args.instant} />
      </StoryResponseRenderer>
    </CriiptoVerifyProvider>
  );
};

export const loginWithRedirect = LoginWithRedirectTemplate.bind({});
export const loginWithInstantRedirect = LoginWithRedirectTemplate.bind({});
(loginWithInstantRedirect as any).args = {
  instant: true
};

function LoginWithPopupButton(props: any) {
  const {loginWithPopup} = useCriiptoVerify();

  return <button onClick={() => loginWithPopup({acrValues: props.acrValues, backdrop: props.backdrop})}>loginWithPopup</button>
}

const LoginWithPopupTemplate = (args: any, {globals} : any) => {
  return (
    <CriiptoVerifyProvider action={(args as any).action} domain={globals.domain} clientID={globals.clientID} response={args.response}>
      <StoryResponseRenderer>
        <LoginWithPopupButton acrValues={args.acrValues} backdrop={args.backdrop} />
      </StoryResponseRenderer>
    </CriiptoVerifyProvider>
  );
};

export const loginWithPopup = LoginWithPopupTemplate.bind({});
export const loginWithPopupBackdropDisabled = LoginWithPopupTemplate.bind({});
(loginWithPopupBackdropDisabled as any).args = {
  backdrop: false
};