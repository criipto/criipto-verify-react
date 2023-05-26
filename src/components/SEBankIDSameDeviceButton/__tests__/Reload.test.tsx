import renderer from 'react-test-renderer';
import ReloadStrategy from '../Reload';
import { Links, clearState } from '../shared';

describe('SEBankID/SameDevice/ReloadStrategy', function () {
  beforeEach(() => {
    clearState();
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