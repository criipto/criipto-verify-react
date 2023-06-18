import {expect} from '@jest/globals';
import { filterAcrValues } from "../utils";

describe('utils', () => {
  describe('filterAcrValues', () => {
    [
      {
        input: [
          'urn:grn:authn:dk:mitid:low',
          'urn:grn:authn:dk:mitid:substantial',
          'urn:grn:authn:dk:mitid:high'
        ],
        expected: ['urn:grn:authn:dk:mitid:low',]
      },
      {
        input: [
          'urn:grn:authn:dk:mitid:substantial',
          'urn:grn:authn:dk:mitid:high',
        ],
        expected: ['urn:grn:authn:dk:mitid:substantial',]
      },
      {
        input: ['urn:grn:authn:dk:mitid:high',],
        expected: ['urn:grn:authn:dk:mitid:high',]
      },
      {
        input: [
          'urn:grn:authn:dk:mitid:low',
          'urn:grn:authn:dk:mitid:high',
        ],
        expected: ['urn:grn:authn:dk:mitid:low',]
      },
      {
        input: [
          'urn:grn:authn:dk:mitid:low',
          'urn:grn:authn:dk:mitid:substantial',
          'urn:grn:authn:dk:mitid:high',
          'urn:grn:authn:dk:mitid:business'
        ],
        expected: [
          'urn:grn:authn:dk:mitid:low',
          'urn:grn:authn:dk:mitid:business'
        ]
      },
      {
        input: ['urn:grn:authn:dk:mitid:business'],
        expected: ['urn:grn:authn:dk:mitid:business']
      },
      {
        input: [
          'urn:grn:authn:dk:mitid',
          'urn:grn:authn:dk:mitid:business'
        ],
        expected: [
          'urn:grn:authn:dk:mitid',
          'urn:grn:authn:dk:mitid:business'
        ]
      },
    ].forEach(({input, expected}) => {
      it(`handles case: ${input.join(', ')}`, () => {
      const actual = filterAcrValues(input);

        expect(actual).toStrictEqual(expected);
      });
    });
  });
});