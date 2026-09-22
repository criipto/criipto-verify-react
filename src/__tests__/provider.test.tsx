import { describe, it, vi, expect, afterEach } from 'vitest';
import { useContext } from 'react';
import { render } from '@testing-library/react';

import CriiptoVerifyProvider, { buildLoginHint, resetRedirectState } from '../provider';
import CriiptoVerifyContext, {
  type BeforeAuthorizeOverrides,
  type BeforeAuthorizeParams,
  type CriiptoVerifyContextInterface,
} from '../context';

describe('CriiptoVerifyProvider', () => {
  describe('buildLoginHint', () => {
    it('should filter out message and action from norway', () => {
      const actual = buildLoginHint(`message:${btoa('asda43123123')} action:login`, {
        options: {
          acrValues: ['urn:grn:authn:no:bankid:substantial'],
        },
      });

      expect(actual).toBe(undefined);
    });

    it('should append extra login hints', () => {
      const actual = buildLoginHint('appswitch:browser', {
        options: {
          acrValues: ['urn:grn:authn:se:bankid:same-device'],
        },
        extraLoginHint: 'stepUp:mrtd',
      });

      expect(actual).toBe('appswitch:browser stepUp:mrtd');
    });

    it('should not allow extra login hints to set action or message', () => {
      const actual = buildLoginHint(null, {
        options: {
          acrValues: ['urn:grn:authn:dk:mitid:substantial'],
        },
        action: 'login',
        extraLoginHint: `action:sign message:${btoa('smuggled')}`,
      });

      expect(actual).toBe('action:login');
    });
  });

  describe('beforeAuthorize', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    function renderProvider(
      beforeAuthorize: (params: BeforeAuthorizeParams) => BeforeAuthorizeOverrides | void,
      props?: { action?: 'sign'; message?: string },
    ) {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => ({
          status: 200,
          json: async () => ({
            jwks_uri: 'https://test.criipto.id/.well-known/jwks',
            acr_values_supported: [
              'urn:grn:authn:dk:mitid:substantial',
              'urn:grn:authn:se:bankid:same-device',
            ],
            clients: [{ client_id: 'urn:test' }],
          }),
        })),
      );

      let context: CriiptoVerifyContextInterface = null as any;
      function Probe() {
        context = useContext(CriiptoVerifyContext);
        return null;
      }

      render(
        <CriiptoVerifyProvider
          domain="test.criipto.id"
          clientID="urn:test"
          redirectUri="https://example.com/callback"
          // Provided so the provider does not have to generate PKCE values
          pkce={{ code_challenge: 'challenge', code_challenge_method: 'S256' }}
          beforeAuthorize={beforeAuthorize}
          {...props}
        >
          <Probe />
        </CriiptoVerifyProvider>,
      );

      return context;
    }

    it('should apply overrides for the acr value being authorized', () => {
      const { buildOptions } = renderProvider(({ acrValues }) =>
        acrValues[0] === 'urn:grn:authn:se:bankid:same-device'
          ? { loginHint: 'stepUp:mrtd', scope: 'openid ssn' }
          : undefined,
      );

      expect(buildOptions({ acrValues: 'urn:grn:authn:se:bankid:same-device' })).toMatchObject({
        loginHint: 'stepUp:mrtd action:login',
        scope: 'openid ssn',
      });
      expect(buildOptions({ acrValues: 'urn:grn:authn:dk:mitid:substantial' })).toMatchObject({
        loginHint: 'action:login',
        scope: undefined,
      });
    });

    it('should normalize acr values to an array', () => {
      const beforeAuthorize = vi.fn();
      const { buildOptions } = renderProvider(beforeAuthorize);

      buildOptions({ acrValues: 'urn:grn:authn:dk:mitid:substantial' });

      expect(beforeAuthorize).toHaveBeenCalledWith(
        expect.objectContaining({ acrValues: ['urn:grn:authn:dk:mitid:substantial'] }),
      );
    });

    it('should override the provider level action and message', () => {
      const { buildOptions } = renderProvider(
        () => ({ action: 'sign', message: 'Sign this document' }),
        { action: 'sign', message: 'Provider message' },
      );

      expect(buildOptions({ acrValues: 'urn:grn:authn:dk:mitid:substantial' })).toMatchObject({
        loginHint: `action:sign message:${btoa('Sign this document')}`,
      });
    });

    it('should merge extra url params over the sdk identifier', () => {
      const { buildOptions } = renderProvider(() => ({ extraUrlParams: { foo: 'bar' } }));

      expect(
        buildOptions({ acrValues: 'urn:grn:authn:dk:mitid:substantial' }).extraUrlParams,
      ).toMatchObject({
        foo: 'bar',
        criipto_sdk: expect.stringContaining('@criipto/verify-react@'),
      });
    });

    it('should leave options untouched when nothing is returned', () => {
      const withHook = renderProvider(() => undefined).buildOptions({
        acrValues: 'urn:grn:authn:dk:mitid:substantial',
      });

      expect(withHook).toMatchObject({
        loginHint: 'action:login',
        redirectUri: 'https://example.com/callback',
      });
    });
  });

  describe('resetRedirectState', () => {
    it('should remove code and state from URL', () => {
      const href = 'https://example.com/subroute?also=this&code=code&state=state&yes=yes';
      const window: any = {
        location: {
          href,
        },
        document: { title: '' },
        history: {
          replaceState: vi.fn(),
        },
      };

      resetRedirectState(window);

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        expect.any(String),
        '/subroute?also=this&yes=yes',
      );
    });
  });
});
