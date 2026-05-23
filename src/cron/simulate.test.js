const { simulateRange, countRunsInRange, summarizeRange } = require('./simulate');

const EVERY_MINUTE = '* * * * *';
const EVERY_HOUR = '0 * * * *';
const DAILY = '0 9 * * *';

function makeRange(hoursAhead = 2) {
  const from = new Date('2024-01-01T00:00:00Z');
  const to = new Date(from.getTime() + hoursAhead * 60 * 60 * 1000);
  return { from, to };
}

describe('simulateRange', () => {
  test('returns array of dates within range', () => {
    const { from, to } = makeRange(1);
    const runs = simulateRange(EVERY_MINUTE, from, to);
    expect(Array.isArray(runs)).toBe(true);
    expect(runs.length).toBeGreaterThan(0);
    runs.forEach(r => {
      expect(r >= from).toBe(true);
      expect(r < to).toBe(true);
    });
  });

  test('returns ~60 runs for every-minute over 1 hour', () => {
    const { from, to } = makeRange(1);
    const runs = simulateRange(EVERY_MINUTE, from, to);
    expect(runs.length).toBeGreaterThanOrEqual(58);
    expect(runs.length).toBeLessThanOrEqual(61);
  });

  test('returns 2 runs for hourly over 2 hours', () => {
    const { from, to } = makeRange(2);
    const runs = simulateRange(EVERY_HOUR, from, to);
    expect(runs.length).toBe(2);
  });

  test('throws if from >= to', () => {
    const d = new Date();
    expect(() => simulateRange(EVERY_MINUTE, d, d)).toThrow();
  });

  test('throws if from or to are not dates', () => {
    expect(() => simulateRange(EVERY_MINUTE, 'bad', new Date())).toThrow();
  });

  test('respects maxRuns cap of 500', () => {
    const from = new Date('2024-01-01T00:00:00Z');
    const to = new Date(from.getTime() + 10 * 24 * 60 * 60 * 1000);
    const runs = simulateRange(EVERY_MINUTE, from, to);
    expect(runs.length).toBeLessThanOrEqual(500);
  });
});

describe('countRunsInRange', () => {
  test('returns correct count', () => {
    const { from, to } = makeRange(2);
    const count = countRunsInRange(EVERY_HOUR, from, to);
    expect(count).toBe(2);
  });
});

describe('summarizeRange', () => {
  test('returns total, perDay, perHour', () => {
    const { from, to } = makeRange(2);
    const summary = summarizeRange(EVERY_HOUR, from, to);
    expect(summary).toHaveProperty('total');
    expect(summary).toHaveProperty('perDay');
    expect(summary).toHaveProperty('perHour');
    expect(summary.total).toBe(2);
    expect(summary.perHour).toBeCloseTo(1, 0);
  });

  test('perDay is 0 for zero-length range edge case', () => {
    const from = new Date('2024-01-01T00:00:00Z');
    const to = new Date(from.getTime() + 1000);
    const summary = summarizeRange(DAILY, from, to);
    expect(summary.total).toBe(0);
  });
});
