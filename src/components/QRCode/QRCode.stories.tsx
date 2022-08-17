import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import QRCode from '../QRCode';
import CriiptoVerifyProvider from '../../provider';
import StoryResponseRenderer from '../../stories/StoryResponseRenderer';

export default {
  title: 'Components/QRCode',
  argTypes: {
    language: {
      name: 'Language',
      control: 'select',
      defaultValue: 'en',
      options: ['en', 'da', 'nb', 'sv']
    },
    action: {
      name: 'Action',
      control: 'select',
      defaultValue: 'login',
      options: ['confirm', 'accept', 'approve', 'sign', 'login']
    },
    completionStrategy: {
      name: 'Completion strategy',
      control: 'select',
      defaultValue: 'client',
      options: ['client', 'openidprovider']
    },
    response: {
      name: 'Response mode',
      control: 'select',
      defaultValue: 'token',
      options: ['token', 'code']
    }
  }
} as ComponentMeta<typeof QRCode>;

const Template: ComponentStory<typeof QRCode> = (args, {globals}) => {
  return (
    <CriiptoVerifyProvider
      completionStrategy={(args as any).completionStrategy}
      response={(args as any).response}
      uiLocales={(args as any).language}
      action={(args as any).action}
      domain={globals.domain}
      clientID={globals.clientID}
      redirectUri={window.location.href}
    >
      <StoryResponseRenderer>
        <QRCode margin={args.margin}>
          {({qrElement, isAcknowledged, isCancelled, isEnabled, retry, error, redirect}) => (
            <div style={{width: '400px'}}>
              {isEnabled === false ? (
                <p>QR is not enabled for this Criipto Application.</p>
              ) : isCancelled ? (
                <p>Login cancelled. <button onClick={retry}>Retry</button></p>
              ) : error ? (
                <p>An error occurred. {error.message}. <button onClick={retry}>Retry</button></p>
              ) : isAcknowledged ? (
                <p>Complete login on device.</p>
              ) : qrElement}

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
  margin: 4
}