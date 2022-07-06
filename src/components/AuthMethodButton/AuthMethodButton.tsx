import React, {useContext, useEffect, useState} from 'react';

import beeid from './logos/beeid.png';
import digid from './logos/digid.png';
import dkmitid from './logos/dkmitid.png';
import dknemid from './logos/dknemid.png';
import ftnmobile from './logos/ftnmobile.png';
import itsme from './logos/itsme.png';
import nobankid from './logos/nobankid.png';
import novipps from './logos/novipps.png';
import sebankid from './logos/sebankid.png';
import sofort from './logos/sofort.png';

import './AuthMethodButton.css';
import CriiptoVerifyContext from '../../context';
import SEBankIDSameDeviceButton from '../SEBankIDSameDeviceButton';

interface ButtonProps {
  className?: string,
  children: React.ReactNode,
  onClick?: React.MouseEventHandler
}

interface AnchorButtonProps extends ButtonProps {
  href: string
}

export function AnchorButton(props: AnchorButtonProps) {
  return (
    <a className={`criipto-verify-button ${props.className}`} href={props.href} onClick={props.onClick}>{props.children}</a>
  );
}

export function Button(props: ButtonProps) {
  return (
    <button className={`criipto-verify-button ${props.className}`} type="button"  onClick={props.onClick}>{props.children}</button>
  );
}

interface AuthMethodButtonProps {
  acrValue: string,
  href?: string;
  onClick?: React.MouseEventHandler,
  children?: React.ReactNode,
  'data-testid'?: string,
  className?: string,
  redirectUri?: string
}

export default function AuthMethodButton(props: AuthMethodButtonProps) {
	const {acrValue} = props;
  const context = useContext(CriiptoVerifyContext);
	const className = `criipto-verify-button-eid ${acrValueToClassName(acrValue)}${props.className ? ` ${props.className}` : ''}`;

  const [href, setHref] = useState(props.href);

  useEffect(() => {
    if (props.href) return;

    context.buildAuthorizeUrl({
      redirectUri: props.redirectUri,
      acrValues: acrValue
    }).then(setHref)
    .catch(console.error);
  }, [props.href, acrValue]);

	if (acrValue === 'urn:grn:authn:se:bankid:same-device') {
		return (
			<SEBankIDSameDeviceButton href={href} className={className}>
				{acrValueToLogo(acrValue) ? <img src={acrValueToLogo(acrValue)} alt="" /> : null}
				<span>{props.children}</span>
			</SEBankIDSameDeviceButton>
		);
	}

	if (href) {
		return (
			<AnchorButton {...props} href={href} className={className}>
				{acrValueToLogo(acrValue) ? <img src={acrValueToLogo(acrValue)} alt="" /> : null}
				<span>{props.children}</span>
			</AnchorButton>
		);
	}

	return (
		<Button {...props} className={className}>
			{acrValueToLogo(acrValue) ? <img src={acrValueToLogo(acrValue)} alt="" /> : null}
			<span>{props.children}</span>
		</Button>
	);
}

function acrValueToClassName(value: string) {
  value = value.replace('urn:grn:authn:', '');
  const segments = value.split(':');
  const classNames = segments.reduce((memo: string[], segment: string) => {
    if (memo.length) {
      return memo.concat([`${memo[memo.length-1]}-${segment}`])
    } else {
      return memo.concat([segment]);
    }
  }, []);

  return classNames.map(className => `criipto-verify-button-${className}`).join(' ');
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