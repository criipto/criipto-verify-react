import { en } from './en';
import { da } from './da';
import { sv } from './sv';
import { nb } from './nb';
import { assertUnreachable } from '../utils';

export type Language = 'en' | 'da' | 'sv' | 'nb';
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
    default:
      assertUnreachable(language);
  }
}
