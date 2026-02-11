import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ReloadStrategy from '../Reload';
import { Links, clearState } from '../shared';
import { determineStrategy } from '../../SEBankIDSameDeviceButton';
import { describe, beforeEach, it, vi, expect } from 'vitest';

describe('SEBankID/SameDevice/ReloadStrategy', function () {
  beforeEach(() => {
    clearState();
  });

  it('calls complete on refresh', async () => {
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

    render(
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

    await userEvent.click(screen.getByText('dummy'));

    expect(onInitiate).toHaveBeenCalled();

    render(
      <ReloadStrategy
        links={links}
        onError={onError}
        onInitiate={onInitiate}
        onLog={onLog}
        onComplete={onComplete}
        redirectUri={redirectUri}
        pkce={undefined}
      >
        <button>dummyy</button>
      </ReloadStrategy>,
    );

    expect(onComplete).toHaveBeenCalled();
  });
});
