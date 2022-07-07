import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import AuthMethodSelector from './AuthMethodSelector';
import CriiptoVerifyProvider from '../../provider';

export default {
  title: 'Components/AuthMethodSelector',
  component: AuthMethodSelector
} as ComponentMeta<typeof AuthMethodSelector>;

const ClientTemplate: ComponentStory<typeof AuthMethodSelector> = (args, {globals}) => {
  return (
    <CriiptoVerifyProvider completionStrategy="client" domain={globals.domain} clientID={globals.clientID} redirectUri="https://httpbin.org/get">
      <AuthMethodSelector {...args} />
    </CriiptoVerifyProvider>
  );
};

const OpenIDProviderTemplate: ComponentStory<typeof AuthMethodSelector> = (args, {globals}) => {
  return (
    <CriiptoVerifyProvider completionStrategy="openidprovider" domain={globals.domain} clientID={globals.clientID} redirectUri="https://httpbin.org/get">
      <AuthMethodSelector {...args} />
    </CriiptoVerifyProvider>
  );
};

export const Default = ClientTemplate.bind({});
Default.storyName ="Completion Strategy: Client (default)"

export const OpenIDProviderCompletionStrategy = OpenIDProviderTemplate.bind({});
OpenIDProviderCompletionStrategy.storyName ="Completion Strategy: OpenID Provider"