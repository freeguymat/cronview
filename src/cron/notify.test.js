import { describe, it, expect, vi } from 'vitest';
import { isRunImminent, buildNotifyMessage, scanForImminent } from './notify.js';
import * as parser from './parser.js';

describe('isRunImminent', () => {
  it('returns true when next run is within threshold', () => {
    const soon = new Date(Date.now() + 2 * 60 * 1000);
    vi.spyOn(parser, 'getNextRuns').mockReturnValue([soon]);
    expect(isRunImminent('* * * * *', 5)).toBe(true);
    vi.restoreAllMocks();
  });

  it('returns false when next run is beyond threshold', () => {
    const later = new Date(Date.now() + 30 * 60 * 1000);
    vi.spyOn(parser, 'getNextRuns').mockReturnValue([later]);
    expect(isRunImminent('0 * * * *', 5)).toBe(false);
    vi.restoreAllMocks();
  });

  it('returns false on parse error', () => {
    vi.spyOn(parser, 'getNextRuns').mockImplementation(() => { throw new Error('bad'); });
    expect(isRunImminent('invalid')).toBe(false);
    vi.restoreAllMocks();
  });
});

describe('buildNotifyMessage', () => {
  it('returns message with seconds when under a minute away', () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 30 * 1000);
    vi.spyOn(parser, 'getNextRuns').mockReturnValue([soon]);
    const msg = buildNotifyMessage('* * * * *', 'My Job', now);
    expect(msg).toMatch(/30s/);
    vi.restoreAllMocks();
  });

  it('returns message with minutes when over a minute away', () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 3 * 60 * 1000);
    vi.spyOn(parser, 'getNextRuns').mockReturnValue([soon]);
    const msg = buildNotifyMessage('* * * * *', 'My Job', now);
    expect(msg).toMatch(/3m/);
    vi.restoreAllMocks();
  });

  it('uses expression as name when no label given', () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 10 * 1000);
    vi.spyOn(parser, 'getNextRuns').mockReturnValue([soon]);
    const msg = buildNotifyMessage('*/5 * * * *', null, now);
    expect(msg).toContain('*/5 * * * *');
    vi.restoreAllMocks();
  });

  it('returns null on error', () => {
    vi.spyOn(parser, 'getNextRuns').mockImplementation(() => { throw new Error(); });
    expect(buildNotifyMessage('bad')).toBeNull();
    vi.restoreAllMocks();
  });
});

describe('scanForImminent', () => {
  it('returns only imminent expressions', () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 1000);
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    vi.spyOn(parser, 'getNextRuns')
      .mockReturnValueOnce([soon])
      .mockReturnValueOnce([later])
      .mockReturnValueOnce([soon]);
    const result = scanForImminent([
      { expression: '* * * * *', label: 'A' },
      { expression: '0 * * * *', label: 'B' },
    ], 5, now);
    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('A');
    vi.restoreAllMocks();
  });
});
