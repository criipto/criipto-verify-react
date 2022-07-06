import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import AuthMethodButton from './AuthMethodButton';
import CriiptoVerifyProvider from '../../provider';
import { acrValueToTitle } from '../../utils';

export default {
  title: 'Components/AuthMethodButton',
  component: AuthMethodButton,
} as ComponentMeta<typeof AuthMethodButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AuthMethodButton> = (args, {globals}) => {
  return (
    <CriiptoVerifyProvider domain={globals.domain} clientID={globals.clientID} redirectUri="https://httpbin.org/get">
      <AuthMethodButton {...args}>
        {acrValueToTitle('en', args.acrValue).title}<br />
        {acrValueToTitle('en', args.acrValue).subtitle}
      </AuthMethodButton>
    </CriiptoVerifyProvider>
  );
};

export const SEBankIDSameDeviceButton = Template.bind({});
SEBankIDSameDeviceButton.args = {
  acrValue: 'urn:grn:authn:se:bankid:same-device'
};