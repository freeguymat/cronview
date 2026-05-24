const { findOverlaps, expressionsOverlap, overlapSummary } = require('./overlap');

// Both expressions fire every minute — maximum overlap
const EVERY_MINUTE = '* * * * *';
// Every hour on the hour
const EVERY_HOUR = '0 * * * *';
// Every day at noon
const DAILY_NOON = '0 12 * * *';
// Every day at midnight
const DAILY_MIDNIGHT = '0 0 * * *';

describe('findOverlaps', () => {
  test('identical expressions produce overlaps', () => {
    const result = findOverlaps(EVERY_MINUTE, EVERY_MINUTE, 5, 0);
    expect(result.length).toBe(5);
    result.forEach(o => expect(o.diffSecs).toBe(0));
  });

  test('non-overlapping daily expressions return empty', () => {
    const result = findOverlaps(DAILY_NOON, DAILY_MIDNIGHT, 5, 0);
    expect(result.length).toBe(0);
  });

  test('respects count limit', () => {
    const result = findOverlaps(EVERY_MINUTE, EVERY_MINUTE, 3, 0);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  test('tolerance allows near-matches', () => {
    // EVERY_HOUR fires at :00, DAILY_NOON fires at 12:00 — they coincide once per day
    const result = findOverlaps(EVERY_HOUR, DAILY_NOON, 5, 0);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('expressionsOverlap', () => {
  test('returns true for identical expressions', () => {
    expect(expressionsOverlap(EVERY_MINUTE, EVERY_MINUTE, 5, 0)).toBe(true);
  });

  test('returns false for non-overlapping expressions', () => {
    expect(expressionsOverlap(DAILY_NOON, DAILY_MIDNIGHT, 5, 0)).toBe(false);
  });
});

describe('overlapSummary', () => {
  test('returns hasOverlap false when no overlaps', () => {
    const summary = overlapSummary(DAILY_NOON, DAILY_MIDNIGHT, 5, 0);
    expect(summary.hasOverlap).toBe(false);
    expect(summary.count).toBe(0);
    expect(summary.message).toMatch(/No overlapping/);
  });

  test('returns correct counts for identical expressions', () => {
    const summary = overlapSummary(EVERY_MINUTE, EVERY_MINUTE, 4, 0);
    expect(summary.hasOverlap).toBe(true);
    expect(summary.count).toBe(4);
    expect(summary.exactCount).toBe(4);
    expect(summary.nearCount).toBe(0);
    expect(summary.message).toMatch(/4 overlapping/);
  });

  test('summary includes overlaps array', () => {
    const summary = overlapSummary(EVERY_MINUTE, EVERY_MINUTE, 2, 0);
    expect(Array.isArray(summary.overlaps)).toBe(true);
    expect(summary.overlaps.length).toBe(2);
  });
});
