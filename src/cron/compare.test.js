import { compareExpressions, findCommonRun, compareFrequency } from './compare.js';
import { jest } from '@jest/globals';

const BASE = new Date('2024-01-15T00:00:00.000Z');

describe('compareExpressions', () => {
  it('returns runs for each expression', () => {
    const result = compareExpressions(['* * * * *', '0 * * * *'], 3, BASE);
    expect(result).toHaveLength(2);
    expect(result[0].expression).toBe('* * * * *');
    expect(result[0].runs).toHaveLength(3);
    expect(result[1].expression).toBe('0 * * * *');
    expect(result[1].runs).toHaveLength(3);
  });

  it('handles single expression', () => {
    const result = compareExpressions(['0 9 * * 1'], 2, BASE);
    expect(result).toHaveLength(1);
    expect(result[0].runs).toHaveLength(2);
  });
});

describe('findCommonRun', () => {
  it('finds a common run for expressions that share a schedule', () => {
    // Both fire every hour on the hour — should find common runs quickly
    const common = findCommonRun(['0 * * * *', '0 */2 * * *'], 200, BASE);
    expect(common.length).toBeGreaterThan(0);
    common.forEach((d) => {
      expect(d.getMinutes()).toBe(0);
    });
  });

  it('returns empty array if no common run found within limit', () => {
    // Artificially low limit
    const common = findCommonRun(['1 3 * * *', '2 4 * * *'], 1, BASE);
    expect(common).toEqual([]);
  });
});

describe('compareFrequency', () => {
  it('identifies the more frequent expression', () => {
    const result = compareFrequency('* * * * *', '0 * * * *', 1, BASE);
    expect(result).toBe('first');
  });

  it('returns equal when both fire same number of times', () => {
    const result = compareFrequency('0 * * * *', '0 * * * *', 1, BASE);
    expect(result).toBe('equal');
  });

  it('returns second when second is more frequent', () => {
    const result = compareFrequency('0 * * * *', '* * * * *', 1, BASE);
    expect(result).toBe('second');
  });
});
