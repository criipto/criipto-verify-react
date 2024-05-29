import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import AuthMethodButton, { PopupParams } from '../AuthMethodButton';
import CriiptoVerifyProvider from '../../provider';
import { acrValueToTitle } from '../../utils';
import StoryResponseRenderer from '../../stories/StoryResponseRenderer';

import customLogo from './logos/ftnmobile@2x.png';

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
    },
    action: {
      name: 'Action',
      control: 'select',
      defaultValue: undefined,
      options: ['confirm', 'accept', 'approve', 'sign', 'login']
    },
    message: {
      name: 'Message (Danish MitID + Swedish BankID)',
      control: 'text',
      defaultValue: undefined
    },
    loginHint: {
      name: 'Login hint',
      control: 'text',
      defaultValue: undefined
    },
  }
} as ComponentMeta<typeof AuthMethodButton>;

function tryBase64Decode(input?: string) {
  if (!input) return null;

  try {
    const decoded = atob(input);
    if (btoa(decoded) === input) return decoded;
    return null;
  } catch (err) {
    return null;
  }
}


// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof AuthMethodButton> = (args, {globals}) => {
  const loginHint = tryBase64Decode((args as any).loginHint);

  return (
    <CriiptoVerifyProvider
      completionStrategy={(args as any).completionStrategy}
      response={(args as any).response}
      domain={globals.domain}
      clientID={globals.clientID}
      redirectUri={window.location.href}
      action={(args as any).action}
      message={(args as any).message}
      loginHint={loginHint}
      prompt="login"
    >
      <StoryResponseRenderer>
        <AuthMethodButton {...args} />
      </StoryResponseRenderer>
    </CriiptoVerifyProvider>
  );
};

export const SEBankIDSameDeviceButton = Template.bind({});
SEBankIDSameDeviceButton.args = {
  acrValue: 'urn:grn:authn:se:bankid:same-device',
  standalone: false
};
SEBankIDSameDeviceButton.storyName = "se:bankid:same-device";

export const DKMitID = Template.bind({});
DKMitID.args = {
  acrValue: 'urn:grn:authn:dk:mitid:low',
  standalone: false
};
DKMitID.storyName = "dk:mitid:low";

export const Href = Template.bind({});
Href.args = {
  acrValue: "urn:grn:authn:se:bankid:another-device:qr",
  href: 'https://localhost:44362/oauth2/authorize?scope=openid&client_id=urn:auth0:th-test&redirect_uri=https://jwt.io/&response_type=id_token&response_mode=fragment&nonce=ecnon&state=etats&acr_values=urn:grn:authn:se:bankid:another-device:qr',
  standalone: false
};
Href.storyName = "href";

export const CustomLogo = Template.bind({});
CustomLogo.args = {
  acrValue: "urn:grn:authn:se:bankid:another-device:qr",
  logo: <img src={customLogo} alt="" />,
  standalone: false
};

export const Popup = Template.bind({});
Popup.args = {
  acrValue: 'urn:grn:authn:se:bankid:another-device:qr',
  popup: true,
  standalone: false
};
Popup.storyName = "Popup - Basic backrop";

export const PopupCallback = Template.bind({});
PopupCallback.args = {
  acrValue: 'urn:grn:authn:se:bankid:another-device:qr',
  popup: () => true,
  standalone: false
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
  popup: (props) => <CustomBackdrop {...props} />,
  standalone: false
};
PopupCustom.storyName = "Popup - Custom react backdrop";
