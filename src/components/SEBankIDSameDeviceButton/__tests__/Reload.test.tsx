import renderer from 'react-test-renderer';
import ReloadStrategy from '../Reload';
import { Links, clearState } from '../shared';
import { determineStrategy } from '../../SEBankIDSameDeviceButton';

describe('SEBankID/SameDevice/ReloadStrategy', function () {
  beforeEach(() => {
    clearState();
  });

  it('uses reload strategy for iOS safari', function () {
    const userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

    expect(determineStrategy(userAgent)).toBe('Reload');
  });

  it('calls complete on refresh', function () {
    const links : Links = {
      launchLinks: {
        universalLink: Math.random().toString(),
        customFileHandlerUrl: Math.random().toString()
      },
      cancelUrl: Math.random().toString(),
      completeUrl: Math.random().toString(),
      pollUrl: Math.random().toString()
    };
    const redirectUri = Math.random().toString();
    const onError = jest.fn();
    const onInitiate = jest.fn();
    const onLog = jest.fn();
    const onComplete = jest.fn();

    let component = renderer.create(
      <ReloadStrategy
        links={links}
        onError={onError}
        onInitiate={onInitiate}
        onLog={onLog}
        onComplete={onComplete}
        redirectUri={redirectUri}
        pkce={undefined}
      >
          <button>dummy</button>
      </ReloadStrategy>
    );

    let tree = component.toJSON();

    renderer.act(() => {
      (tree as any).props.onClick();
    });

    expect(onInitiate).toHaveBeenCalled();

    renderer.act(() => {
      component = renderer.create(
        <ReloadStrategy
          links={links}
          onError={onError}
          onInitiate={onInitiate}
          onLog={onLog}
          onComplete={onComplete}
          redirectUri={redirectUri}
          pkce={undefined}
        >
            <button>dummy</button>
        </ReloadStrategy>
      );
    });

    expect(onComplete).toHaveBeenCalled();
  });
});