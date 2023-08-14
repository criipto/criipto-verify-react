import {expect} from '@jest/globals';
import { buildLoginHint, resetRedirectState } from '../provider';

describe('CriiptoVerifyProvider', () => {
  describe('buildLoginHint', () => {
    it('should filter out message and action from norway', () => {

      const actual = buildLoginHint(`message:${btoa('asda43123123')} action:login`, {
        options: {
          acrValues: ['urn:grn:authn:no:bankid:substantial']
        }
      })

      expect(actual).toBe(undefined);
    });
  });

  describe('resetRedirectState', () => {
    it('should remove code and state from URL', () => {
      const href = 'https://example.com/subroute?also=this&code=code&state=state&yes=yes'
      const window : any = {
        location: {
          href
        },
        document: {title: ''},
        history: {
          replaceState: jest.fn()
        }
      };

      resetRedirectState(window);

      expect(window.history.replaceState).toHaveBeenCalledWith({}, expect.any(String), '/subroute?also=this&yes=yes')
    });
  });
});