import React, {useContext, useEffect, useState} from 'react';

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

import './AuthMethodButton.css';
import { getMobileOS } from '../../device';
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

const mobileOS = getMobileOS();

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
	const className = `criipto-eid-btn ${acrValueToClassName(acrValue)}${props.className ? ` ${props.className}` : ''}`;

  const [href, setHref] = useState(props.href);

  useEffect(() => {
    if (props.href) return;

		let loginHint : string | undefined = undefined;

		if (acrValue.startsWith('urn:grn:authn:dk:mitid') && mobileOS) {
			loginHint = `appswitch:${mobileOS} target:web`;
		}

    context.buildAuthorizeUrl({
      redirectUri: props.redirectUri,
      acrValues: acrValue,
			loginHint
    }).then(setHref)
    .catch(console.error);
  }, [props.href, acrValue]);

	if (acrValue === 'urn:grn:authn:se:bankid:same-device') {
		return (
			<SEBankIDSameDeviceButton
				redirectUri={props.redirectUri}
				href={href}
				className={className}
				logo={<img src={acrValueToLogo(acrValue)} alt="" />}
			>
				{props.children}
			</SEBankIDSameDeviceButton>
		);
	}

	if (href) {
		return (
			<AnchorButton {...props} href={href} className={className}>
				{acrValueToLogo(acrValue) ? (
					<div className="criipto-eid-logo">
						<img src={acrValueToLogo(acrValue)} alt="" />
					</div>
				) : null}
				{props.children}
			</AnchorButton>
		);
	}

	return (
		<Button {...props} className={className}>
			{acrValueToLogo(acrValue) ? (
				<div className="criipto-eid-logo">
					<img src={acrValueToLogo(acrValue)} alt="" />
				</div>
			) : null}
			{props.children}
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

  return classNames.map(className => `criipto-eid-btn--${className}`).join(' ');
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