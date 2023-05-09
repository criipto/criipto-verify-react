import {expect} from '@jest/globals';
import renderer, {act} from 'react-test-renderer';
import CriiptoVerifyProvider, { buildLoginHint } from '../provider';

describe('CriiptoVerifyProvider', () => {
  it('should work in a serverside environment', async () => {
    let component = renderer.create(
      <CriiptoVerifyProvider
        domain="samples.criipto.id"
        clientID="urn:criipto:samples:criipto-verify-react"
        redirectUri="http://localhost:3000"
      >
        <div></div>
      </CriiptoVerifyProvider>
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
    });
  });

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
});