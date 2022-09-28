import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import AuthMethodSelector from '../AuthMethodSelector';
import CriiptoVerifyProvider from '../../provider';
import StoryResponseRenderer from '../../stories/StoryResponseRenderer';

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
  'urn:grn:authn:se:bankid:another-device',
  'urn:grn:authn:se:bankid:another-device:qr',
  'urn:grn:authn:se:bankid:same-device'
];

export default {
  title: 'Components/AuthMethodSelector',
  component: AuthMethodSelector,
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
      defaultValue: undefined,
      options: ['confirm', 'accept', 'approve', 'sign', 'login']
    },
    message: {
      name: 'Message (Danish MitID)',
      control: 'text',
      defaultValue: undefined
    },
    loginHint: {
      name: 'Login hint',
      control: 'text',
      defaultValue: undefined
    },
    acrValues: {
      options: ALL_ACR_VALUES,
      control: { type: 'multi-select' },
      defaultValue: undefined
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
    },
    popup: {
      name: 'Popup',
      control: 'boolean',
      defaultValue: false
    }
  }
} as ComponentMeta<typeof AuthMethodSelector>;

const Template: ComponentStory<typeof AuthMethodSelector> = (args, {globals}) => {
  return (
    <CriiptoVerifyProvider
      completionStrategy={(args as any).completionStrategy}
      response={(args as any).response}
      action={(args as any).action}
      message={(args as any).message}
      loginHint={(args as any).loginHint}
      domain={globals.domain}
      clientID={globals.clientID}
      redirectUri={args.redirectUri}
      uiLocales={args.language}
    >
      <StoryResponseRenderer>
        <AuthMethodSelector {...args} />
      </StoryResponseRenderer>
    </CriiptoVerifyProvider>
  );
};

export const Default = Template.bind({});
Default.storyName = "All";
Default.args = {
  redirectUri: window.location.href,
  acrValues: ALL_ACR_VALUES
};

export const OneOfEach = Template.bind({
  
});
OneOfEach.storyName = "One of each";
OneOfEach.args = {
  redirectUri: window.location.href,
  acrValues: [
    'urn:grn:authn:dk:nemid:poces',
    'urn:grn:authn:dk:mitid:low',
    'urn:grn:authn:se:bankid:same-device',
    'urn:grn:authn:no:vipps',
    'urn:grn:authn:no:bankid:substantial',
    'urn:grn:authn:itsme:basic'
  ]
};

export const Sweden = Template.bind({
  
});
Sweden.storyName = "Sweden";
Sweden.args = {
  redirectUri: window.location.href,
  acrValues: [
    'urn:grn:authn:se:bankid:same-device',
    'urn:grn:authn:se:bankid:another-device:qr',
  ]
};

export const NoAcrValues = Template.bind({
  
});
NoAcrValues.storyName = "acr_values from oidc metadata";
NoAcrValues.args = {
  redirectUri: window.location.href,
  acrValues: undefined
};

export const OnSelect = Template.bind({});
OnSelect.storyName = "onSelect"
OnSelect.args = {
  redirectUri: window.location.href,
  acrValues: ALL_ACR_VALUES,
  onSelect: console.log.bind(console)
};
