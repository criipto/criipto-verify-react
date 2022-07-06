export const DKMITID_PREFIX = 'urn:grn:authn:dk:mitid';

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

export type Language = 'en' | 'da' | 'sv' | 'nb';

export function acrValueToTitle(language: Language, value: string) : {title: string, subtitle?: string} {
	value = value.replace('urn:grn:authn:', '');

  if (value.startsWith('be:eid')) {
    return {title: autoTitleCase(value).replace('BEEID', 'Belgian eID')};
  }
  if (value.startsWith('nl:digid')) {
    return {title: autoTitleCase(value).replace('NL ', '')};
  }
  if (value.startsWith('dk:mitid')) {
    return {title: 'MitID'};
  }
  if (value.startsWith('dk:nemid')) {
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
  if (value.startsWith('fi')) {
    return {title: autoTitleCase(value).replace('FI', 'FTN')};
  }
  if (value.startsWith('itsme')) {
    return {title: autoTitleCase(value).replace('me', 'ME')};
  }
  if (value.startsWith('se:bankid')) {
		let subtitle : string | undefined = undefined;
		let suffix = value.replace('se:bankid:', '');

		if (suffix === 'same-device') {
			if (language === 'en') subtitle = 'On this device';
			if (language === 'da') subtitle = 'På denne enhed';
			if (language === 'sv') subtitle = 'På denna enheten';
			if (language === 'nb') subtitle = 'På denne enheten';
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
  if (value.startsWith('de:sofort')) {
    return {title: autoTitleCase(value).replace('DE ', '')};
  }
  if (value.startsWith('no:bankid')) {
    let subtitle : string | undefined = undefined;
    if (value.endsWith(':substantial')) {
      if (language === 'en') subtitle = 'Biometrics';
			if (language === 'da') subtitle = 'Biometri ';
			if (language === 'sv') subtitle = 'Biometri';
			if (language === 'nb') subtitle = 'Biometri';
    }
    return {title: autoTitleCase(value).replace('NO ', ''), subtitle};
  }
  if (value.startsWith('no:vipps')) {
    return {title: autoTitleCase(value).replace('NO ', '')};
  }

  return {title: autoTitleCase(value)};
}

export function filterAcrValues(input: string[]) {
  let original = input.slice();
  let dkmitidMethod : string | null = lowestMitIDValue(input);

  if (dkmitidMethod) {
    return input.filter(s => !s.startsWith(DKMITID_PREFIX)).concat([dkmitidMethod]).sort((a, b) => original.indexOf(a) - original.indexOf(b));
  }
  return input;
}