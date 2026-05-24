import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRunsInWindow, describeWindow, windowSummary, hasRunInWindow } from './window.js';
import * as parser from './parser.js';

vi.mock('./parser.js');

const BASE = new Date('2024-01-01T00:00:00Z');
const HOUR = 3600000;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getRunsInWindow', () => {
  it('returns runs within the window', () => {
    const runs = [
      new Date(BASE.getTime() + 10 * 60000),
      new Date(BASE.getTime() + 20 * 60000),
      new Date(BASE.getTime() + 90 * 60000),
    ];
    parser.getNextRuns.mockReturnValue(runs);
    const end = new Date(BASE.getTime() + HOUR);
    const result = getRunsInWindow('* * * * *', BASE, end);
    expect(result).toHaveLength(2);
  });

  it('returns empty array when start >= end', () => {
    const result = getRunsInWindow('* * * * *', BASE, BASE);
    expect(result).toEqual([]);
  });

  it('throws on invalid dates', () => {
    expect(() => getRunsInWindow('* * * * *', 'bad', new Date())).toThrow();
  });
});

describe('describeWindow', () => {
  it('describes minutes', () => {
    const end = new Date(BASE.getTime() + 30 * 60000);
    expect(describeWindow(BASE, end)).toBe('30 minutes');
  });

  it('describes hours', () => {
    const end = new Date(BASE.getTime() + 3 * HOUR);
    expect(describeWindow(BASE, end)).toBe('3 hours');
  });

  it('describes days', () => {
    const end = new Date(BASE.getTime() + 2 * 24 * HOUR);
    expect(describeWindow(BASE, end)).toBe('2 days');
  });
});

describe('windowSummary', () => {
  it('returns count and first/last', () => {
    const r1 = new Date(BASE.getTime() + 5 * 60000);
    const r2 = new Date(BASE.getTime() + 55 * 60000);
    parser.getNextRuns.mockReturnValue([r1, r2]);
    const end = new Date(BASE.getTime() + HOUR);
    const s = windowSummary('0 * * * *', BASE, end);
    expect(s.count).toBe(2);
    expect(s.first).toBe(r1);
    expect(s.last).toBe(r2);
  });

  it('handles empty window', () => {
    parser.getNextRuns.mockReturnValue([]);
    const end = new Date(BASE.getTime() + HOUR);
    const s = windowSummary('0 0 1 1 *', BASE, end);
    expect(s.count).toBe(0);
    expect(s.first).toBeNull();
  });
});

describe('hasRunInWindow', () => {
  it('returns true when runs exist', () => {
    parser.getNextRuns.mockReturnValue([new Date(BASE.getTime() + 10000)]);
    expect(hasRunInWindow('* * * * *', BASE, new Date(BASE.getTime() + HOUR))).toBe(true);
  });

  it('returns false when no runs', () => {
    parser.getNextRuns.mockReturnValue([]);
    expect(hasRunInWindow('0 0 1 1 *', BASE, new Date(BASE.getTime() + HOUR))).toBe(false);
  });
});
