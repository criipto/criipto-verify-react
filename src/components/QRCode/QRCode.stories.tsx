import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import QRCode from '../QRCode';
import CriiptoVerifyProvider from '../../provider';
import StoryResponseRenderer from '../../stories/StoryResponseRenderer';

const ALL_ACR_VALUES = [
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
  'urn:grn:authn:no:bankid',
  'urn:grn:authn:no:bankid:central',
  'urn:grn:authn:no:bankid:mobile',
  'urn:grn:authn:no:bankid:substantial',
  'urn:grn:authn:no:vipps',
  'urn:grn:authn:se:bankid:another-device:qr',
  'urn:grn:authn:se:bankid:same-device',
];

export default {
  title: 'Components/QRCode',
  argTypes: {
    language: {
      name: 'Language',
      control: 'select',
      defaultValue: 'en',
      options: ['en', 'da', 'nb', 'sv'],
    },
    action: {
      name: 'Action',
      control: 'select',
      defaultValue: 'login',
      options: ['confirm', 'accept', 'approve', 'sign', 'login'],
    },
    message: {
      name: 'Message (Danish MitID)',
      control: 'text',
      defaultValue: undefined,
    },
    completionStrategy: {
      name: 'Completion strategy',
      control: 'select',
      defaultValue: 'client',
      options: ['client', 'openidprovider'],
    },
    response: {
      name: 'Response mode',
      control: 'select',
      defaultValue: 'token',
      options: ['token', 'code'],
    },
    acrValues: {
      options: ALL_ACR_VALUES,
      control: { type: 'multi-select' },
      defaultValue: undefined,
    },
    state: {
      name: 'State',
      control: 'text',
      defaultValue: undefined,
    },
    nonce: {
      name: 'Nonce',
      control: 'text',
      defaultValue: undefined,
    },
    loginHint: {
      name: 'Login hint',
      control: 'text',
      defaultValue: undefined,
    },
  },
} as ComponentMeta<typeof QRCode>;

const Template: ComponentStory<typeof QRCode> = (args, { globals }) => {
  return (
    <CriiptoVerifyProvider
      completionStrategy={(args as any).completionStrategy}
      response={(args as any).response}
      uiLocales={(args as any).language}
      action={(args as any).action}
      message={(args as any).message}
      state={(args as any).state}
      nonce={(args as any).nonce}
      domain={globals.domain}
      clientID={globals.clientID}
      redirectUri={window.location.href}
      loginHint={(args as any).loginHint}
    >
      <StoryResponseRenderer>
        <QRCode margin={args.margin} acrValues={args.acrValues}>
          {({ qrElement, isAcknowledged, isCancelled, isEnabled, retry, error, redirect }) => (
            <div style={{ width: '400px' }}>
              {isEnabled === false ? (
                <p>QR is not enabled for this Criipto Application.</p>
              ) : isCancelled ? (
                <p>
                  Login cancelled. <button onClick={retry}>Retry</button>
                </p>
              ) : error ? (
                <p>
                  An error occurred. {error.message}. <button onClick={retry}>Retry</button>
                </p>
              ) : isAcknowledged ? (
                <p>Complete login on device.</p>
              ) : (
                qrElement
              )}

              <button onClick={redirect}>Authenticate on this device</button>
            </div>
          )}
        </QRCode>
      </StoryResponseRenderer>
    </CriiptoVerifyProvider>
  );
};

export const Default = Template.bind({});
Default.args = {
  margin: 4,
};
