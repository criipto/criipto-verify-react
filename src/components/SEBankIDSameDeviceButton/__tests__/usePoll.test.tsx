import { render, screen, waitFor, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { type Links } from '../shared';
import { describe, it, beforeAll, afterEach, afterAll, vi, expect } from 'vitest';
import { usePoll } from '../usePoll';

const links = {
  pollUrl: 'https://example.com/poll',
} as Links;
const targetUrl = 'https://example.com/complete';

const serverFn = vi
  .fn()
  // First call returns 202 accepted
  .mockImplementationOnce(() =>
    HttpResponse.json(null, {
      status: 202,
    }),
  )
  // Second call returns the target URL
  .mockImplementationOnce(() =>
    HttpResponse.json(
      {
        targetUrl,
      },
      {
        status: 200,
      },
    ),
  );

const server = setupServer(http.get(links.pollUrl, serverFn));

beforeAll(() => {
  // Make @testing-library/user-event play nice with fake timers https://github.com/testing-library/user-event/issues/1115
  vi.stubGlobal('jest', { advanceTimersByTime: vi.advanceTimersByTime.bind(vi) });

  server.listen();
  vi.useFakeTimers();
});

const user = userEvent.setup({
  advanceTimers: vi.advanceTimersByTime.bind(vi),
});
afterEach(() => {
  server.resetHandlers();
  vi.useRealTimers();
});
afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

describe('SEBankID/SameDevice/usePoll', async function () {
  it('keeps polling until receiving a success', async () => {
    const onError = vi.fn();
    const onComplete = vi.fn();

    renderHook(() => {
      usePoll({
        shouldPoll: true,
        onComplete,
        onError,
        pollUrl: links.pollUrl,
      });
    });

    vi.runAllTimers();
    await waitFor(() => expect(serverFn).toHaveBeenCalledOnce());
    expect(onComplete).not.toHaveBeenCalled();
    vi.runAllTimers();
    await waitFor(() => expect(serverFn).toHaveBeenCalledTimes(2));
    expect(onComplete).toHaveBeenCalledWith(targetUrl);
  });
});
