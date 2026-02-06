import React from 'react';
import digid from './logos/nldigid@2x.png';
import dkmitid from './logos/dkmitid@2x.png';
import dknemid from './logos/dknemid@2x.png';
import ftnmobile from './logos/ftnmobile@2x.png';
import itsme from './logos/itsme@2x.png';
import nobankid from './logos/nobankid@2x.png';
import novipps from './logos/novipps@2x.png';
import sebankid from './logos/sebankid@2x.png';
import sefrejaid from './logos/sefrejaid@2x.png';
import depersonalausweis from './logos/depersonalausweis@2x.png';
import ukoneid from './logos/ukoneid@2x.png';

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
  if (value.startsWith('urn:grn:authn:nl:digid')) {
    return digid;
  }
  if (value.startsWith('urn:grn:authn:dk:mitid')) {
    return dkmitid;
  }
  if (value.startsWith('urn:grn:authn:dk:nemid')) {
    return dknemid;
  }
  if (value.startsWith('urn:grn:authn:fi:mobile')) {
    return ftnmobile;
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
}
