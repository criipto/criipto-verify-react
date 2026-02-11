import renderer from 'react-test-renderer';
import ReloadStrategy from '../Reload';
import { Links, clearState } from '../shared';
import { determineStrategy } from '../../SEBankIDSameDeviceButton';
import { describe, beforeEach, it, vi, expect } from 'vitest';

describe('SEBankID/SameDevice/ReloadStrategy', function () {
  beforeEach(() => {
    clearState();
  });

  it('calls complete on refresh', function () {
    const links: Links = {
      launchLinks: {
        universalLink: Math.random().toString(),
        customFileHandlerUrl: Math.random().toString(),
      },
      cancelUrl: Math.random().toString(),
      completeUrl: Math.random().toString(),
      pollUrl: Math.random().toString(),
    };
    const redirectUri = Math.random().toString();
    const onError = vi.fn();
    const onInitiate = vi.fn();
    const onLog = vi.fn();
    const onComplete = vi.fn();

    let component!: renderer.ReactTestRenderer;
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
        </ReloadStrategy>,
      );
    });

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
        </ReloadStrategy>,
      );
    });

    expect(onComplete).toHaveBeenCalled();
  });
});
