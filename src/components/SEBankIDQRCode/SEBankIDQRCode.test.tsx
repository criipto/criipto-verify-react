import { describe, it, expect } from 'vitest';
import { parseCompleteUrl } from '../SEBankIDQRCode';

describe('SEBankIDQRCode', function () {
  describe('parseCompleteUrl', () => {
    it('processes targetUrl as error response when necessary', async () => {
      const actual = await parseCompleteUrl(
        'https://jwt.io/?test=yesdzxcsdadasd&error=access_denied&error_description=Collect%20failed%3A%20userCancel&state=etats',
      );

      expect(actual).toStrictEqual({
        location:
          'https://jwt.io/?test=yesdzxcsdadasd&error=access_denied&error_description=Collect%20failed%3A%20userCancel&state=etats',
        response: {
          error: 'access_denied',
          error_description: 'Collect failed: userCancel',
          state: 'etats',
          test: 'yesdzxcsdadasd',
        },
      });
    });
  });
});
