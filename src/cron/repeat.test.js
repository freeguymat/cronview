import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRepeatInterval, describeInterval, haveSameInterval, repeatSummary } from './repeat.js';
import * as parser from './parser.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('describeInterval', () => {
  it('handles seconds', () => {
    expect(describeInterval(30_000)).toBe('every 30 seconds');
  });

  it('handles 1 minute', () => {
    expect(describeInterval(60_000)).toBe('every 1 minute');
  });

  it('handles minutes', () => {
    expect(describeInterval(5 * 60_000)).toBe('every 5 minutes');
  });

  it('handles hours', () => {
    expect(describeInterval(2 * 60 * 60_000)).toBe('every 2 hours');
  });

  it('handles days', () => {
    expect(describeInterval(24 * 60 * 60_000)).toBe('every 1 day');
  });

  it('returns unknown for null', () => {
    expect(describeInterval(null)).toBe('unknown');
  });
});

describe('getRepeatInterval', () => {
  it('returns ms between first two runs', () => {
    const base = new Date('2024-01-01T00:00:00Z');
    const r1 = new Date('2024-01-01T00:05:00Z');
    const r2 = new Date('2024-01-01T00:10:00Z');
    vi.spyOn(parser, 'getNextRuns').mockReturnValue([r1, r2]);
    expect(getRepeatInterval('*/5 * * * *', base)).toBe(5 * 60_000);
  });

  it('returns null when fewer than 2 runs', () => {
    vi.spyOn(parser, 'getNextRuns').mockReturnValue([new Date()]);
    expect(getRepeatInterval('0 0 31 2 *')).toBeNull();
  });
});

describe('haveSameInterval', () => {
  it('returns true when intervals match', () => {
    const base = new Date('2024-01-01T00:00:00Z');
    const stub = vi
      .spyOn(parser, 'getNextRuns')
      .mockReturnValueOnce([new Date(base.getTime() + 60_000), new Date(base.getTime() + 120_000)])
      .mockReturnValueOnce([new Date(base.getTime() + 60_000), new Date(base.getTime() + 120_000)]);
    expect(haveSameInterval('* * * * *', '* * * * *', base)).toBe(true);
    stub.mockRestore();
  });
});

describe('repeatSummary', () => {
  it('returns intervalMs and description', () => {
    const base = new Date('2024-01-01T00:00:00Z');
    vi.spyOn(parser, 'getNextRuns').mockReturnValue([
      new Date(base.getTime() + 3600_000),
      new Date(base.getTime() + 7200_000),
    ]);
    const result = repeatSummary('0 * * * *', base);
    expect(result.intervalMs).toBe(3600_000);
    expect(result.description).toBe('every 1 hour');
  });
});
