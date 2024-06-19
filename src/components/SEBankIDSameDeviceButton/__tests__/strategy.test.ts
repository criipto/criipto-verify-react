import { determineStrategy } from "../../SEBankIDSameDeviceButton";

describe('SEBankID/strategy', function () {
  it('uses reload strategy for iOS safari', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Reload',
      linkType: 'universal',
      redirect: true
    });
  });

  test('uses reload strategy for iOS Safari (2)', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';
    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Reload',
      linkType: 'universal',
      redirect: true
    });
  })

  test('uses foreground strategy for iOS WebKit', function () {
    // source: Expo WebView
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'universal',
      redirect: false
    });
  });

  it('uses poll strategy for Windows Chrome', function () {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Poll',
      linkType: 'scheme',
      redirect: false
    });
  });

  it('uses foreground strategy for Android Chrome', function () {
    const userAgent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'universal',
      redirect: false
    });
  });

  it('uses foreground strategy for Android Samsung Browser', function () {
    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/99.9 Chrome/96.0.4664.104 Safari/537.36';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'scheme',
      redirect: false
    });
  })

  it('uses foreground strategy for iOS Safari with resume disabled', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';
    const loginHint = 'appswitch:resumeUrl:disable';

    expect(determineStrategy(userAgent, loginHint)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'universal',
      redirect: false
    });
  });

  test('uses reload strategy for iOS WebKit with resume disabled', function () {
    // source: Expo WebView
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    const loginHint = 'appswitch:resumeUrl:disable';

    expect(determineStrategy(userAgent, loginHint)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'universal',
      redirect: false
    });
  });

  it('uses foreground strategy for iOS Instagram', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 Instagram 335.1.8.26.85 (iPhone14,3; iOS 17_5_1; da_DK; da; scale=3.00; 1284x2778; 609775437) NW/3';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'universal',
      redirect: false
    });
  });

  it('uses foreground strategy for iOS Chrome', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'universal',
      redirect: false
    });
  });

  it('uses foreground strategy for iOS Firefox', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/127.0  Mobile/15E148 Safari/605.1.15';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'universal',
      redirect: false
    });
  });

  it('uses foreground strategy for iOS Opera', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1 OPT/4.7.0';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'universal',
      redirect: false
    });
  });

  // Cannot be distinguished from iOS Safari
  it('uses reload strategy for iOS Brave', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Reload',
      linkType: 'universal',
      redirect: true
    });
  });

  it('uses reload strategy for iOS Edge', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/125.0.2535.96 Version/17.0 Mobile/15E148 Safari/604.1';

    expect(determineStrategy(userAgent, undefined)).toStrictEqual({
      resume: 'Foreground',
      linkType: 'universal',
      redirect: false
    });
  });
});