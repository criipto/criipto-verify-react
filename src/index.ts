import { default as CriiptoVerifyProvider } from './provider';
import {
  default as AuthMethodSelector,
  Sweden as AuthMethodSelectorSweden,
} from './components/AuthMethodSelector';
import { default as AuthMethodButton } from './components/AuthMethodButton';
import { default as AuthButtonGroup } from './components/AuthButtonGroup';
import { default as QRCode } from './components/QRCode';
import { default as SEBankIDQRCode } from './components/SEBankIDQRCode';
import { default as useCriiptoVerify } from './use-criipto-verify';

export { type Result, type Action, actions } from './context';
export { type Language, filterAcrValues } from './utils';
export { OAuth2Error } from '@criipto/auth-js';
export {
  CriiptoVerifyProvider,
  AuthMethodSelector,
  AuthMethodSelectorSweden,
  useCriiptoVerify,
  QRCode,
  SEBankIDQRCode,
};
export { AuthMethodButton, AuthMethodButton as AuthButton, AuthButtonGroup };

import './index.css';
