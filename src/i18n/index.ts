import { en } from './en';
import { da } from './da';
import { sv } from './sv';
import { nb } from './nb';
import { fi } from './fi';
import { de } from './de';
import { nl } from './nl';
import { assertUnreachable } from '../utils';

export type Language = 'en' | 'da' | 'sv' | 'nb' | 'fi' | 'de' | 'nl';
export type I18N = Record<keyof typeof en, string>;

export function getI18n(language: Language): I18N {
  switch (language) {
    case 'en':
      return en;
    case 'da':
      return da;
    case 'sv':
      return sv;
    case 'nb':
      return nb;
    case 'fi':
      return fi;
    case 'de':
      return de;
    case 'nl':
      return nl;
    default:
      assertUnreachable(language);
  }
}
