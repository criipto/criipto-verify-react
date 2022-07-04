import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import AuthMethodSelector from './AuthMethodSelector';
import CriiptoVerifyProvider from '../../provider';

export default {
  title: 'Components/AuthMethodSelector',
  component: AuthMethodSelector,
} as ComponentMeta<typeof AuthMethodSelector>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AuthMethodSelector> = (args, {globals}) => {
  return (
    <CriiptoVerifyProvider domain={globals.domain} clientID={globals.clientID} redirectUri="https://httpbin.org/get">
      <AuthMethodSelector {...args} />
    </CriiptoVerifyProvider>
  );
};

export const Default = Template.bind({});