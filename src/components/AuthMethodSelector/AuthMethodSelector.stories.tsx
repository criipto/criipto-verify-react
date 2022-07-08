import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import AuthMethodSelector from './AuthMethodSelector';
import CriiptoVerifyProvider from '../../provider';
import StoryResponseRenderer from '../../stories/StoryResponseRenderer';

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
Default.storyName = "AuthMethodSelector"