import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import AuthMethodSelector from './AuthMethodSelector';
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
      defaultValue: 'login',
      options: ['confirm', 'accept', 'approve', 'sign', 'login']
    },
    acrValues: {
      options: ALL_ACR_VALUES,
      control: { type: 'multi-select' },
      defaultValue: ALL_ACR_VALUES
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
} as ComponentMeta<typeof AuthMethodSelector>;

const Template: ComponentStory<typeof AuthMethodSelector> = (args, {globals}) => {
  return (
    <CriiptoVerifyProvider completionStrategy={(args as any).completionStrategy} response={(args as any).response} action={(args as any).action} domain={globals.domain} clientID={globals.clientID} redirectUri="https://httpbin.org/get">
      <StoryResponseRenderer>
        <AuthMethodSelector {...args}  />
      </StoryResponseRenderer>
    </CriiptoVerifyProvider>
  );
};

export const Default = Template.bind({});
Default.storyName = "All"

export const OneOfEach = Template.bind({
  
});
OneOfEach.storyName = "One of each";
OneOfEach.args = {
  acrValues: [
    'urn:grn:authn:dk:nemid:poces',
    'urn:grn:authn:dk:mitid:low',
    'urn:grn:authn:se:bankid:same-device',
    'urn:grn:authn:no:vipps',
    'urn:grn:authn:no:bankid:substantial',
    'urn:grn:authn:itsme:basic'
  ]
}