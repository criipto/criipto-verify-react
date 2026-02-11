import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { type Links } from '../shared';
import SEBankIDSameDeviceForeground from '../Foreground';
import { describe, it, beforeAll, vi, expect, afterEach } from 'vitest';
import { useEffect } from 'react';
import { type UsePollProps } from '../usePoll';

const links = {
  pollUrl: 'https://example.com/poll',
} as Links;
const targetUrl = 'https://example.com/complete';

vi.mock('../usePoll', () => ({
  usePoll: ({ onComplete }: UsePollProps) => {
    useEffect(() => {
      onComplete(targetUrl);
    }, [targetUrl]);
  },
}));

beforeAll(() => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    writable: true,
  });
});

afterEach(() => cleanup());

describe('SEBankID/SameDevice/ForegroundStrategy', async function () {
  it('calls complete immediately when state is visible', async () => {
    const onError = vi.fn();
    const onInitiate = vi.fn();
    const onLog = vi.fn();
    const onComplete = vi.fn();

    // @ts-expect-error
    document.visibilityState = 'visible';

    render(
      <SEBankIDSameDeviceForeground
        links={links}
        onError={onError}
        onInitiate={onInitiate}
        onLog={onLog}
        onComplete={onComplete}
      >
        <button>dummy</button>
      </SEBankIDSameDeviceForeground>,
    );

    await userEvent.click(screen.getByText('dummy'));

    expect(onInitiate).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith(targetUrl);
  });

  it('does not call complete before state changes to visible', async () => {
    const onError = vi.fn();
    const onInitiate = vi.fn();
    const onLog = vi.fn();
    const onComplete = vi.fn();

    // @ts-expect-error
    document.visibilityState = 'hidden';

    render(
      <SEBankIDSameDeviceForeground
        links={links}
        onError={onError}
        onInitiate={onInitiate}
        onLog={onLog}
        onComplete={onComplete}
      >
        <button>dummy</button>
      </SEBankIDSameDeviceForeground>,
    );

    await userEvent.click(screen.getByText('dummy'));

    expect(onInitiate).toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();

    // @ts-expect-error
    document.visibilityState = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() => expect(onComplete).toHaveBeenCalledWith(targetUrl));
  });
});
