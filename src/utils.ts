import { Action } from "./context";

declare var __VERSION__: string;
export const VERSION = typeof __VERSION__ === "undefined" ? "N/A": __VERSION__;

export const DKMITID_PREFIX = 'urn:grn:authn:dk:mitid';
export const FTN_PREFIX = 'urn:grn:authn:fi';

export function lowestMitIDValue(input: string[]) : string | null {
  let dkmitidMethod : string | null = null;

  input.forEach(s => {
    if (s.startsWith(DKMITID_PREFIX)) {
      if (!dkmitidMethod) {
        dkmitidMethod = s;
      } else {
        let newLevel = s.replace(DKMITID_PREFIX, '');
        let oldLevel = dkmitidMethod.replace(DKMITID_PREFIX, '');
        if (newLevel === ':low' && [':substantial', ':high'].includes(oldLevel)) {
          dkmitidMethod = s;
        }
        else if (newLevel === ':substantial' && oldLevel === ':high') {
          dkmitidMethod = s;
        }
      }
    }
  });

  return dkmitidMethod;
}

function autoTitleCase(input: string) {
  var segments = input.split(/:|-/).map(segment => {
    segment = segment.replace(/id(\s|$)/, 'ID');
    if (segment.length === 2) return segment.toUpperCase();
    return segment.substr(0, 1).toUpperCase() + segment.substr(1);
  });
  return segments.join(' ');
}

function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export function assertUnreachableLanguage(x: never): never {
  throw new Error(`Unsupported language ${x}`);
}
export type Language = 'en' | 'da' | 'sv' | 'nb';

export function stringifyAction(language: Language, action: Action) : string {
  if (action === 'login') {
    if (language === 'da') return 'Login med';
    else if (language === 'sv') return 'Logga in med'
    else if (language === 'nb') return 'Logg inn med';
    return 'Login with';
  }
  if (action === 'approve') {
    if (language === 'da') return 'Godkend med';
    else if (language === 'sv') return 'Godkänn med'
    else if (language === 'nb') return 'Godkjenne med';
    return 'Approve with';
  }
  if (action === 'sign') {
    if (language === 'da') return 'Underskriv med';
    else if (language === 'sv') return 'Signera med'
    else if (language === 'nb') return 'Signer med';
    return 'Sign with';
  }
  if (action === 'confirm') {
    if (language === 'da') return 'Bekræft med';
    else if (language === 'sv') return 'Bekräfta med'
    else if (language === 'nb') return 'Bekreft med';
    return 'Confirm with';
  }
  if (action === 'accept') {
    if (language === 'da') return 'Accepter med';
    else if (language === 'sv') return 'Acceptera med'
    else if (language === 'nb') return 'Aksepterer med';
    return 'Accept with';
  }

  assertUnreachable(action);
}

export function acrValueToProviderPrefix(value: string) {
  value = value.replace('urn:grn:authn:', '');

  if (value.startsWith('fi')) {
    return 'fi';
  }
  else if (value.startsWith('itsme')) {
    return 'itsme';
  } else {
    return value.split(':').slice(0, 2).join(':');
  }
}

export function acrValueToTitle(language: Language, value: string) : {title: string, subtitle?: string} {
	value = value.replace('urn:grn:authn:', '');
  const provider = acrValueToProviderPrefix(value);

  if (provider === 'be:eid') {
    return {title: autoTitleCase(value).replace('BEEID', 'Belgian eID')};
  }
  if (provider === 'nl:digid') {
    return {title: autoTitleCase(value).replace('NL ', '')};
  }
  if (provider === 'dk:mitid') {
    return {title: 'MitID'};
  }
  if (provider === 'dk:nemid') {
		let subtitle : string | undefined = undefined;
		let suffix = value.replace('dk:nemid:', '');
		
		if (suffix === 'poces') {
			if (language === 'en') subtitle = 'Personal';
			if (language === 'da') subtitle = 'Personlig';
			if (language === 'sv') subtitle = 'Personlig';
			if (language === 'nb') subtitle = 'Personlig';
		}
		if (suffix === 'moces') {
			if (language === 'en') subtitle = 'Employee key card';
			if (language === 'da') subtitle = 'Medarbejder nøglekort';
			if (language === 'sv') subtitle = 'Anställd nyckelkort';
			if (language === 'nb') subtitle = 'Ansatt nøkkelkort';
		}
		if (suffix === 'moces:codefile') {
			if (language === 'en') subtitle = 'Employee key file';
			if (language === 'da') subtitle = 'Medarbejder nøglefil';
			if (language === 'sv') subtitle = 'Anställd nyckelfil';
			if (language === 'nb') subtitle = 'Ansatt nøkkelfil';
		}

    return {
			title: 'NemID',
			subtitle
		}
  }
  if (value === 'fi:mobile-id') {
    if (language === 'en') return {title: 'Finnish Mobile ID'};
    if (language === 'da') return {title: 'Finsk Mobil ID'};
    if (language === 'sv') return {title: 'Finskt Mobil ID'};
    if (language === 'nb') return {title: 'Finsk Mobil ID'};
  }
  if (value === 'fi:bank-id') {
    if (language === 'en') return {title: 'Finnish Bank ID'};
    if (language === 'da') return {title: 'Finsk Bank ID'};
    if (language === 'sv') return {title: 'Finskt Bank ID'};
    if (language === 'nb') return {title: 'Finsk Bank ID'};
  }
  if (provider === 'fi') {
    return {title: autoTitleCase(value).replace('FI', 'FTN')};
  }
  if (provider === 'itsme') {
    return {title: autoTitleCase(value).replace('me', 'ME')};
  }
  if (provider === 'se:bankid') {
		let subtitle : string | undefined = undefined;
		let suffix = value.replace('se:bankid:', '');

		if (suffix === 'same-device') {
			if (language === 'en') subtitle = 'On this device';
			if (language === 'da') subtitle = 'På denne enhed';
			if (language === 'sv') subtitle = 'På denna enhet';
			if (language === 'nb') subtitle = 'På denne enhet';
		}
		if (suffix === 'another-device') {
			if (language === 'en') subtitle = 'With your SSN';
			if (language === 'da') subtitle = 'Med dit personnummer';
			if (language === 'sv') subtitle = 'Med ditt personnummer';
			if (language === 'nb') subtitle = 'Med personnummeret ditt';
		}
		if (suffix === 'another-device:qr') {
			if (language === 'en') subtitle = 'With QR Code';
			if (language === 'da') subtitle = 'Med QR-kode';
			if (language === 'sv') subtitle = 'Med QR-kod';
			if (language === 'nb') subtitle = 'Med QR-kode';
		}

    return {title: 'BankID', subtitle};
  }
  if (provider === 'de:sofort') {
    return {title: autoTitleCase(value).replace('DE ', '')};
  }
  if (provider === 'no:bankid') {
    let subtitle : string | undefined = undefined;
    if (value.endsWith(':substantial')) {
      if (language === 'en') subtitle = 'Biometrics';
			if (language === 'da') subtitle = 'Biometri ';
			if (language === 'sv') subtitle = 'Biometri';
			if (language === 'nb') subtitle = 'Biometri';
    }
    return {title: subtitle ? 'BankID' : autoTitleCase(value).replace('NO ', ''), subtitle};
  }
  if (provider === 'no:vipps') {
    return {title: autoTitleCase(value).replace('NO ', '')};
  }

  return {title: autoTitleCase(value)};
}

export function filterAcrValues(input: string[]) {
  let original = input.slice();
  let dkmitidMethod : string | null = lowestMitIDValue(input);
  let reduced = input.slice();

  if (dkmitidMethod) {
    reduced = input.filter(s => !s.startsWith(DKMITID_PREFIX)).concat([dkmitidMethod]).sort((a, b) => original.indexOf(a) - original.indexOf(b));
  }

  if (input.includes(`${FTN_PREFIX}:all`)) {
    if (!reduced.includes(`${FTN_PREFIX}:bank-id`)) reduced.push(`${FTN_PREFIX}:bank-id`);
    if (!reduced.includes(`${FTN_PREFIX}:mobile-id`)) reduced.push(`${FTN_PREFIX}:mobile-id`);
    reduced = reduced.filter(s => s !== `${FTN_PREFIX}:all`);
  }
  return reduced;
}