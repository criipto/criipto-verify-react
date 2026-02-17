import { Action } from './context';
import { getI18n, type Language } from './i18n';

declare var __VERSION__: string;
export const VERSION = typeof __VERSION__ === 'undefined' ? 'N/A' : __VERSION__;

export const DKMITID_PREFIX = 'urn:grn:authn:dk:mitid';
export const DKMITID_BUSINESS = 'urn:grn:authn:dk:mitid:business';
export const FTN_PREFIX = 'urn:grn:authn:fi';

export function lowestMitIDValue(input: string[]): string | null {
  let dkmitidMethod: string | null = null;

  input.forEach((s) => {
    if (s.startsWith(DKMITID_PREFIX) && s !== DKMITID_BUSINESS) {
      if (!dkmitidMethod) {
        dkmitidMethod = s;
      } else {
        let newLevel = s.replace(DKMITID_PREFIX, '');
        let oldLevel = dkmitidMethod.replace(DKMITID_PREFIX, '');
        if (newLevel === ':low' && [':substantial', ':high'].includes(oldLevel)) {
          dkmitidMethod = s;
        } else if (newLevel === ':substantial' && oldLevel === ':high') {
          dkmitidMethod = s;
        }
      }
    }
  });

  return dkmitidMethod;
}

function autoTitleCase(input: string) {
  var segments = input.split(/:|-/).map((segment) => {
    segment = segment.replace(/id(\s|$)/, 'ID');
    if (segment.length === 2) return segment.toUpperCase();
    return segment.substr(0, 1).toUpperCase() + segment.substr(1);
  });
  return segments.join(' ');
}

export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export function stringifyAction(language: Language, action: Action): string {
  const i18n = getI18n(language);

  switch (action) {
    case 'login':
      return i18n.loginWith;
    case 'approve':
      return i18n.approveWith;
    case 'sign':
      return i18n.signWith;
    case 'confirm':
      return i18n.confirmWith;
    case 'accept':
      return i18n.acceptWith;
    default:
      assertUnreachable(action);
  }
}

export function acrValueToProviderPrefix(value: string) {
  value = value.replace('urn:grn:authn:', '');

  if (value.startsWith('fi')) {
    return 'fi';
  } else if (value.startsWith('itsme')) {
    return 'itsme';
  } else {
    return value.split(':').slice(0, 2).join(':');
  }
}

export function acrValueToTitle(
  language: Language,
  value: string,
  { disambiguate }: { disambiguate: boolean },
): { title: string; subtitle?: string } {
  const i18n = getI18n(language);
  value = value.replace('urn:grn:authn:', '');
  const provider = acrValueToProviderPrefix(value);

  if (provider === 'dk:mitid') {
    let suffix = value.replace('dk:mitid:', '');
    if (suffix === 'business') {
      return {
        title: i18n.mitidBusiness,
      };
    }

    return { title: 'MitID' };
  }
  if (value === 'fi:mobile-id') {
    return {
      title: i18n.finnishMobileID,
    };
  }
  if (value === 'fi:bank-id') {
    return {
      title: i18n.finnishBankID,
    };
  }
  if (provider === 'fi') {
    return { title: autoTitleCase(value).replace('FI', 'FTN') };
  }
  if (provider === 'itsme') {
    return { title: autoTitleCase(value).replace('me', 'ME') };
  }
  if (provider === 'se:bankid') {
    let subtitle: string | undefined = undefined;
    let suffix = value.replace('se:bankid:', '');
    let title = 'BankID';

    if (suffix === 'same-device') {
      subtitle = i18n.sameDevice;
    }
    if (suffix === 'another-device') {
      subtitle = i18n.anotherDevice;
    }
    if (suffix === 'another-device:qr') {
      subtitle = i18n.anotherDeviceQR;
    }
    if (disambiguate) {
      title = i18n.swedishBankID;
    }

    return { title, subtitle };
  }
  if (provider === 'no:bankid') {
    let subtitle: string | undefined = undefined;
    let title = 'BankID';
    if (value.endsWith(':substantial')) {
      subtitle = i18n.biometrics;
    }
    if (disambiguate) {
      title = i18n.norwegianBankID;
    }
    return { title, subtitle };
  }
  if (provider === 'no:vipps') {
    return { title: autoTitleCase(value).replace('NO ', '') };
  }
  if (provider === 'se:frejaid') {
    return { title: 'FrejaID' };
  }
  if (provider === 'uk:oneid') {
    return { title: 'OneID' };
  }
  if (provider === 'de:personalausweis') {
    return { title: 'Personalausweis' };
  }

  return { title: autoTitleCase(value) };
}

export function filterAcrValues(input: string[]) {
  let original = input.slice();
  let dkmitidMethod: string | null = lowestMitIDValue(input);
  let reduced = input.slice();

  if (dkmitidMethod) {
    reduced = input
      .filter((s) => !s.startsWith(DKMITID_PREFIX) || s === DKMITID_BUSINESS)
      .concat([dkmitidMethod])
      .sort((a, b) => original.indexOf(a) - original.indexOf(b));
  }

  if (input.includes(`${FTN_PREFIX}:all`)) {
    if (!reduced.includes(`${FTN_PREFIX}:bank-id`)) reduced.push(`${FTN_PREFIX}:bank-id`);
    if (!reduced.includes(`${FTN_PREFIX}:mobile-id`)) reduced.push(`${FTN_PREFIX}:mobile-id`);
    reduced = reduced.filter((s) => s !== `${FTN_PREFIX}:all`);
  }
  return reduced;
}

export function isSingle(acrValue: string, acrValues: string[]) {
  const provider = acrValueToProviderPrefix(acrValue);
  const count = acrValues.reduce(
    (memo, acrValue) => memo + (acrValueToProviderPrefix(acrValue) === provider ? 1 : 0),
    0,
  );
  return count === 1;
}

const ambigousProviders = ['se:bankid', 'no:bankid'];
/**
 * A provider is considered ambiguous iff:
 * 1. It is in the list of ambiguous providers
 * 2. There is another ambiguous provider in the arc values list
 */
export function isAmbiguous(acrValue: string, acrValues: string[]) {
  const provider = acrValueToProviderPrefix(acrValue);
  const isProviderAmbiguous = ambigousProviders.includes(provider);
  const otherAmbiguousProvider =
    acrValues.find((otherAcrValue) => {
      const otherProvider = acrValueToProviderPrefix(otherAcrValue);
      return provider != otherProvider && ambigousProviders.includes(otherProvider);
    }) != null;

  return isProviderAmbiguous && otherAmbiguousProvider;
}

export function trySessionStorage() {
  try {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    return sessionStorage;
  } catch (err) {
    /**
     * Failed to read the 'sessionStorage' property from 'Window': Access is denied for this document.
     * (if storage is disabled in the browser)
     */
    return null;
  }
}
