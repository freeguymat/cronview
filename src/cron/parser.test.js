import { describe, it, expect } from 'vitest';
import { getNextRuns, validateExpression, describeExpression } from './parser.js';

describe('validateExpression', () => {
  it('returns valid for a correct cron expression', () => {
    const result = validateExpression('* * * * *');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('returns invalid for a bad cron expression', () => {
    const result = validateExpression('99 99 99 99 99');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('handles empty string', () => {
    const result = validateExpression('');
    expect(result.valid).toBe(false);
  });
});

describe('getNextRuns', () => {
  it('returns correct number of next runs', () => {
    const { nextRuns, error } = getNextRuns('* * * * *', 5);
    expect(error).toBeNull();
    expect(nextRuns).toHaveLength(5);
  });

  it('returns dates in ascending order', () => {
    const { nextRuns } = getNextRuns('0 9 * * *', 3);
    for (let i = 1; i < nextRuns.length; i++) {
      expect(nextRuns[i].getTime()).toBeGreaterThan(nextRuns[i - 1].getTime());
    }
  });

  it('returns error for invalid expression', () => {
    const { nextRuns, error } = getNextRuns('invalid cron');
    expect(nextRuns).toHaveLength(0);
    expect(error).toBeTruthy();
  });

  it('respects fromDate parameter', () => {
    const from = new Date('2024-01-01T00:00:00Z');
    const { nextRuns } = getNextRuns('0 12 * * *', 1, from);
    expect(nextRuns[0].getTime()).toBeGreaterThan(from.getTime());
  });
});

describe('describeExpression', () => {
  it('describes every-minute expression', () => {
    expect(describeExpression('* * * * *')).toBe('Every minute');
  });

  it('describes interval-based minute expression', () => {
    expect(describeExpression('*/15 * * * *')).toBe('Every 15 minutes');
  });

  it('describes daily schedule', () => {
    expect(describeExpression('30 9 * * *')).toBe('Daily at 09:30');
  });

  it('falls back for complex expressions', () => {
    const result = describeExpression('0 0 1 1 *');
    expect(result).toContain('Custom schedule');
  });
});
