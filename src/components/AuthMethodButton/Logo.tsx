import React from 'react';
import beeid from './logos/beeid@2x.png';
import digid from './logos/nldigid@2x.png';
import dkmitid from './logos/dkmitid@2x.png';
import dknemid from './logos/dknemid@2x.png';
import ftnmobile from './logos/ftnmobile@2x.png';
import ftnbankid from './logos/ftnbankid@2x.png';
import itsme from './logos/itsme@2x.png';
import nobankid from './logos/nobankid@2x.png';
import novipps from './logos/novipps@2x.png';
import sebankid from './logos/sebankid@2x.png';
import sofort from './logos/sofort@2x.png';

export interface AuthMethodButtonLogoProps {
  acrValue: string
  /**
   * base64 image string, e.x. data:image/png;base64,
   * or a ReactElement
   */
  logo?: React.ReactElement | string
}
export default function AuthMethodButtonLogo(props: AuthMethodButtonLogoProps) {
  const logo =
    typeof props.logo === "string" ? <img src={props.logo} alt="" /> :
    props.logo ?? (acrValueToLogo(props.acrValue) ? <img src={acrValueToLogo(props.acrValue)} alt="" /> : null);

  if (logo) return <div className="criipto-eid-logo">{logo}</div>
  return null;
}

function acrValueToLogo(value : string) {
  if (value.startsWith('urn:grn:authn:be:eid')) {
    return beeid;
  }
  if (value.startsWith('urn:grn:authn:nl:digid')) {
    return digid;
  }
  if (value.startsWith('urn:grn:authn:dk:mitid')) {
    return dkmitid;
  }
  if (value.startsWith('urn:grn:authn:dk:nemid')) {
    return dknemid;
  }
  if (value.startsWith('urn:grn:authn:fi:bank-id')) {
    return ftnbankid;
  }
  if (value.startsWith('urn:grn:authn:fi')) {
    return ftnmobile;
  }
  if (value.startsWith('urn:grn:authn:itsme')) {
    return itsme;
  }
  if (value.startsWith('urn:grn:authn:se:bankid')) {
    return sebankid;
  }
  if (value.startsWith('urn:grn:authn:de:sofort')) {
    return sofort;
  }
  if (value.startsWith('urn:grn:authn:no:bankid')) {
    return nobankid;
  }
  if (value.startsWith('urn:grn:authn:no:vipps')) {
    return novipps;
  }
}