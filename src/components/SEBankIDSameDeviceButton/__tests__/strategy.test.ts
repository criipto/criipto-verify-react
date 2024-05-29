import { determineStrategy } from "../../SEBankIDSameDeviceButton";

describe('SEBankID/strategy', function () {
  it('uses reload strategy for iOS safari', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

    expect(determineStrategy(userAgent, undefined)).toBe('Reload');
  });

  test('uses reload strategy for iOS Safari (2)', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
    expect(determineStrategy(userAgent, undefined)).toBe('Reload');
  })

  test('uses reload strategy for iOS WebKit', function () {
    // source: Expo WebView
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    expect(determineStrategy(userAgent, undefined)).toBe('Reload');
  });

  it('uses poll strategy for Windows Chrome', function () {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

    expect(determineStrategy(userAgent, undefined)).toBe('Poll');
  });

  it('uses foreground strategy for Android Chrome', function () {
    const userAgent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36';

    expect(determineStrategy(userAgent, undefined)).toBe('Foreground');
  });

  it('uses foreground strategy for iOS Safari with resume disabled', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
    const loginHint = 'appswitch:resumeUrl:disable';

    expect(determineStrategy(userAgent, loginHint)).toBe('Foreground');
  });

  test('uses reload strategy for iOS WebKit with resume disabled', function () {
    // source: Expo WebView
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    const loginHint = 'appswitch:resumeUrl:disable';

    expect(determineStrategy(userAgent, loginHint)).toBe('Foreground');
  });
});