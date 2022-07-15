import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import AuthMethodButton, { PopupParams } from './AuthMethodButton';
import CriiptoVerifyProvider from '../../provider';
import { acrValueToTitle } from '../../utils';
import StoryResponseRenderer from '../../stories/StoryResponseRenderer';

export default {
  title: 'Components/AuthMethodButton',
  argTypes: {
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
} as ComponentMeta<typeof AuthMethodButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AuthMethodButton> = (args, {globals}) => {
  return (
    <CriiptoVerifyProvider
      completionStrategy={(args as any).completionStrategy}
      response={(args as any).response}
      domain={globals.domain}
      clientID={globals.clientID}
      redirectUri={window.location.href}
    >
      <StoryResponseRenderer>
        <AuthMethodButton {...args}>
          {acrValueToTitle('en', args.acrValue).title}<br />
          {acrValueToTitle('en', args.acrValue).subtitle}
        </AuthMethodButton>
      </StoryResponseRenderer>
    </CriiptoVerifyProvider>
  );
};

export const SEBankIDSameDeviceButton = Template.bind({});
SEBankIDSameDeviceButton.args = {
  acrValue: 'urn:grn:authn:se:bankid:same-device'
};
SEBankIDSameDeviceButton.storyName = "se:bankid:same-device";


export const DKMitID = Template.bind({});
DKMitID.args = {
  acrValue: 'urn:grn:authn:dk:mitid:low'
};
DKMitID.storyName = "dk:mitid:low";

export const Popup = Template.bind({});
Popup.args = {
  acrValue: 'urn:grn:authn:se:bankid:another-device:qr',
  popup: true
};
Popup.storyName = "Popup - Basic backrop";

export const PopupCallback = Template.bind({});
PopupCallback.args = {
  acrValue: 'urn:grn:authn:se:bankid:another-device:qr',
  popup: () => true
};
PopupCallback.storyName = "Popup - Callback";

const CustomBackdrop : React.FC<PopupParams> = (props) => {
  return (
    <div>
      Custom backdrop for {props.acrValue}
      <button onClick={() => props.onHide()}>Hide</button>
    </div>
  );
}

export const PopupCustom = Template.bind({});
PopupCustom.args = {
  acrValue: 'urn:grn:authn:se:bankid:another-device:qr',
  popup: (props) => <CustomBackdrop {...props} />
};
PopupCustom.storyName = "Popup - Custom react backdrop";
