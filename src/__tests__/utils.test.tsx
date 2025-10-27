import { expect } from '@jest/globals';
import { filterAcrValues, isAmbiguous } from '../utils';

describe('utils', () => {
  describe('filterAcrValues', () => {
    [
      {
        input: [
          'urn:grn:authn:dk:mitid:low',
          'urn:grn:authn:dk:mitid:substantial',
          'urn:grn:authn:dk:mitid:high',
        ],
        expected: ['urn:grn:authn:dk:mitid:low'],
      },
      {
        input: ['urn:grn:authn:dk:mitid:substantial', 'urn:grn:authn:dk:mitid:high'],
        expected: ['urn:grn:authn:dk:mitid:substantial'],
      },
      {
        input: ['urn:grn:authn:dk:mitid:high'],
        expected: ['urn:grn:authn:dk:mitid:high'],
      },
      {
        input: ['urn:grn:authn:dk:mitid:low', 'urn:grn:authn:dk:mitid:high'],
        expected: ['urn:grn:authn:dk:mitid:low'],
      },
      {
        input: [
          'urn:grn:authn:dk:mitid:low',
          'urn:grn:authn:dk:mitid:substantial',
          'urn:grn:authn:dk:mitid:high',
          'urn:grn:authn:dk:mitid:business',
        ],
        expected: ['urn:grn:authn:dk:mitid:low', 'urn:grn:authn:dk:mitid:business'],
      },
      {
        input: ['urn:grn:authn:dk:mitid:business'],
        expected: ['urn:grn:authn:dk:mitid:business'],
      },
      {
        input: ['urn:grn:authn:dk:mitid', 'urn:grn:authn:dk:mitid:business'],
        expected: ['urn:grn:authn:dk:mitid', 'urn:grn:authn:dk:mitid:business'],
      },
    ].forEach(({ input, expected }) => {
      it(`handles case: ${input.join(', ')}`, () => {
        const actual = filterAcrValues(input);

        expect(actual).toStrictEqual(expected);
      });
    });
  });

  describe('isAmbiguous', () => {
    [
      {
        input: {
          acrValue: 'urn:grn:authn:se:bankid',
          acrValues: ['urn:grn:authn:se:bankid'],
        },
        expected: false,
      },
      {
        input: {
          acrValue: 'urn:grn:authn:se:bankid',
          acrValues: ['urn:grn:authn:se:bankid', 'urn:grn:authn:dk:mitid:substantial'],
        },
        expected: false,
      },
      {
        input: {
          acrValue: 'urn:grn:authn:se:bankid:same-device',
          acrValues: [
            'urn:grn:authn:se:bankid:same-device',
            'urn:grn:authn:se:bankid:another-device:qr',
          ],
        },
        expected: false,
      },
      {
        input: {
          acrValue: 'urn:grn:authn:se:bankid',
          acrValues: ['urn:grn:authn:se:bankid', 'urn:grn:authn:no:bankid'],
        },
        expected: true,
      },
    ].forEach(({ input, expected }) => {
      const actual = isAmbiguous(input.acrValue, input.acrValues);

      expect(actual).toStrictEqual(expected);
    });
  });
});
