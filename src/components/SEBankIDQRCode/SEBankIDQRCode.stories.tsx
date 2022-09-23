import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import SEBankIDQRCode from '../SEBankIDQRCode';
import CriiptoVerifyProvider from '../../provider';
import StoryResponseRenderer from '../../stories/StoryResponseRenderer';

export default {
  title: 'Components/SEBankIDQRCode',
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
} as ComponentMeta<typeof SEBankIDQRCode>;

const Template: ComponentStory<typeof SEBankIDQRCode> = (args, {globals}) => {
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
        <SEBankIDQRCode>
          {({qrElement, error, isCompleting, retry}) => (
            <div style={{width: '400px'}}>
              {error ? (
                <React.Fragment>
                  <p>{error.message}</p>
                  <button onClick={retry}>Retry</button>
                </React.Fragment>
              ) : isCompleting ? 'Logging in' : qrElement}
            </div>
          )}
        </SEBankIDQRCode>
      </StoryResponseRenderer>
    </CriiptoVerifyProvider>
  );
};

export const Default = Template.bind({});