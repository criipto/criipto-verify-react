import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import {
  AuthMethodButtonContainer,
  AuthMethodButtonComponent,
  PopupParams,
} from '../AuthMethodButton';
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
      options: ['client', 'openidprovider'],
    },
    response: {
      name: 'Response mode',
      control: 'select',
      defaultValue: 'token',
      options: ['token', 'code'],
    },
    action: {
      name: 'Action',
      control: 'select',
      defaultValue: undefined,
      options: ['confirm', 'accept', 'approve', 'sign', 'login'],
    },
    message: {
      name: 'Message (Danish MitID + Swedish BankID)',
      control: 'text',
      defaultValue: undefined,
    },
    loginHint: {
      name: 'Login hint',
      control: 'text',
      defaultValue: undefined,
    },
  },
} as ComponentMeta<typeof AuthMethodButtonContainer>;

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
const ContainerTemplate: ComponentStory<typeof AuthMethodButtonContainer> = (args, { globals }) => {
  const loginHint = tryBase64Decode((args as any).loginHint) ?? (args as any).loginHint;

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
        <AuthMethodButtonContainer {...args} />
      </StoryResponseRenderer>
    </CriiptoVerifyProvider>
  );
};

const ComponentTemplate: ComponentStory<typeof AuthMethodButtonComponent> = (args, { globals }) => {
  return (
    <div style={{ display: 'flex', flexFlow: 'column', gap: '5px' }}>
      {[
        'urn:grn:authn:dk:mitid:high',
        'urn:grn:authn:dk:mitid:low',
        'urn:grn:authn:dk:mitid:substantial',
        'urn:grn:authn:dk:mitid:business',
        'urn:grn:authn:fi:all',
        'urn:grn:authn:fi:bank-id',
        'urn:grn:authn:fi:mobile-id',
        'urn:grn:authn:itsme:advanced',
        'urn:grn:authn:itsme:basic',
        'urn:grn:authn:no:bankid',
        'urn:grn:authn:no:bankid:central',
        'urn:grn:authn:no:bankid:mobile',
        'urn:grn:authn:no:bankid:substantial',
        'urn:grn:authn:no:vipps',
        'urn:grn:authn:se:bankid:another-device:qr',
        'urn:grn:authn:se:bankid:same-device',
        'urn:grn:authn:se:frejaid',
        'urn:grn:authn:uk:oneid',
        'urn:grn:authn:de:personalausweis',
        'urn:grn:authn:nl:idin',
      ].flatMap((acrValue) =>
        ['confirm', 'accept', 'approve', 'sign', 'login'].map((action) =>
          ['en', 'da', 'nb', 'sv'].map((language) => (
            <AuthMethodButtonComponent
              {...args}
              acrValue={acrValue}
              action={action}
              language={language}
            />
          )),
        ),
      )}
    </div>
  );
};

export const SEBankIDSameDeviceButton = ContainerTemplate.bind({});
SEBankIDSameDeviceButton.args = {
  acrValue: 'urn:grn:authn:se:bankid:same-device',
  standalone: false,
};
SEBankIDSameDeviceButton.storyName = 'se:bankid:same-device';

export const DKMitID = ContainerTemplate.bind({});
DKMitID.args = {
  acrValue: 'urn:grn:authn:dk:mitid:low',
  standalone: false,
};
DKMitID.storyName = 'dk:mitid:low';

export const Href = ContainerTemplate.bind({});
Href.args = {
  acrValue: 'urn:grn:authn:se:bankid:another-device:qr',
  href: 'https://localhost:44362/oauth2/authorize?scope=openid&client_id=urn:auth0:th-test&redirect_uri=https://jwt.io/&response_type=id_token&response_mode=fragment&nonce=ecnon&state=etats&acr_values=urn:grn:authn:se:bankid:another-device:qr',
  standalone: false,
};
Href.storyName = 'href';

export const CustomLogo = ContainerTemplate.bind({});
CustomLogo.args = {
  acrValue: 'urn:grn:authn:se:bankid:another-device:qr',
  logo: <img src={customLogo} alt="" />,
  standalone: false,
};

export const Popup = ContainerTemplate.bind({});
Popup.args = {
  acrValue: 'urn:grn:authn:se:bankid:another-device:qr',
  popup: true,
  standalone: false,
};
Popup.storyName = 'Popup - Basic backrop';

export const PopupCallback = ContainerTemplate.bind({});
PopupCallback.args = {
  acrValue: 'urn:grn:authn:dk:mitid:low',
  popup: () => true,
  standalone: false,
};
PopupCallback.storyName = 'Popup - Callback';

const CustomBackdrop: React.FC<PopupParams> = (props) => {
  return (
    <div>
      Custom backdrop for {props.acrValue}
      <button onClick={() => props.onHide()}>Hide</button>
    </div>
  );
};

export const PopupCustom = ContainerTemplate.bind({});
PopupCustom.args = {
  acrValue: 'urn:grn:authn:se:bankid:another-device:qr',
  popup: (props) => <CustomBackdrop {...props} />,
  standalone: false,
};
PopupCustom.storyName = 'Popup - Custom react backdrop';

export const Components = ComponentTemplate.bind({});
Components.args = {};
Components.storyName = 'As components only';
