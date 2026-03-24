import React from 'react';
import dkmitid from './logos/dkmitid.png';
import dkmitiderhverv from './logos/dkmitiderhverv.png';
import ftnmobile from './logos/ftnmobile.png';
import itsme from './logos/itsme.png';
import nobankid from './logos/nobankid.png';
import novipps from './logos/novipps.png';
import sebankid from './logos/sebankid.png';
import sefrejaid from './logos/sefrejaid.png';
import depersonalausweis from './logos/depersonalausweis.png';
import ukoneid from './logos/ukoneid.png';
import idin from './logos/idin.png';
import ftn from './logos/ftn.png';

export interface AuthMethodButtonLogoProps {
  acrValue: string;
  /**
   * base64 image string, e.x. data:image/png;base64,
   * or a ReactElement
   */
  logo?: React.ReactElement | string;
}
export default function AuthMethodButtonLogo(props: AuthMethodButtonLogoProps) {
  const logo =
    typeof props.logo === 'string' ? (
      <img src={props.logo} alt="" />
    ) : (
      (props.logo ??
      (acrValueToLogo(props.acrValue) ? (
        <img src={acrValueToLogo(props.acrValue)} alt="" />
      ) : (
        <span>&nbsp;</span>
      )))
    );

  if (logo) return <div className="criipto-eid-logo">{logo}</div>;
  return null;
}

function acrValueToLogo(value: string) {
  if (value.startsWith('urn:grn:authn:dk:mitid:business')) {
    return dkmitiderhverv;
  }
  if (value.startsWith('urn:grn:authn:dk:mitid')) {
    return dkmitid;
  }
  if (value.startsWith('urn:grn:authn:fi:mobile')) {
    return ftnmobile;
  }
  if (value.startsWith('urn:grn:authn:fi')) {
    return ftn;
  }
  if (value.startsWith('urn:grn:authn:itsme')) {
    return itsme;
  }
  if (value.startsWith('urn:grn:authn:se:bankid')) {
    return sebankid;
  }
  if (value.startsWith('urn:grn:authn:no:bankid')) {
    return nobankid;
  }
  if (value.startsWith('urn:grn:authn:no:vipps')) {
    return novipps;
  }
  if (value.startsWith('urn:grn:authn:se:frejaid')) {
    return sefrejaid;
  }
  if (value.startsWith('urn:grn:authn:uk:oneid')) {
    return ukoneid;
  }
  if (value.startsWith('urn:grn:authn:de:personalausweis')) {
    return depersonalausweis;
  }
  if (value.startsWith('urn:grn:authn:nl:idin')) {
    return idin;
  }
}
