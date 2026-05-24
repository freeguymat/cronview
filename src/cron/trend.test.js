const { getRunTrend, classifyTrend, describeTrend } = require('./trend');

describe('getRunTrend', () => {
  const base = new Date('2024-01-15T12:00:00Z');

  test('returns numeric counts for each window', () => {
    const trend = getRunTrend('*/15 * * * *', base);
    expect(typeof trend.hourly).toBe('number');
    expect(typeof trend.daily).toBe('number');
    expect(typeof trend.weekly).toBe('number');
  });

  test('high-frequency expression has more runs', () => {
    const high = getRunTrend('*/5 * * * *', base);
    const low = getRunTrend('0 0 * * 0', base);
    expect(high.daily).toBeGreaterThan(low.daily);
  });

  test('weekly count >= daily count', () => {
    const trend = getRunTrend('0 9 * * *', base);
    expect(trend.weekly).toBeGreaterThanOrEqual(trend.daily);
  });
});

describe('classifyTrend', () => {
  test('very-high for 4+ per hour', () => {
    expect(classifyTrend({ hourly: 4, daily: 96, weekly: 672 })).toBe('very-high');
  });

  test('high for 1+ per hour', () => {
    expect(classifyTrend({ hourly: 1, daily: 24, weekly: 168 })).toBe('high');
  });

  test('medium for 4+ per day', () => {
    expect(classifyTrend({ hourly: 0, daily: 6, weekly: 42 })).toBe('medium');
  });

  test('low for 1+ per day', () => {
    expect(classifyTrend({ hourly: 0, daily: 1, weekly: 7 })).toBe('low');
  });

  test('rare for less than daily', () => {
    expect(classifyTrend({ hourly: 0, daily: 0, weekly: 1 })).toBe('rare');
  });
});

describe('describeTrend', () => {
  test('returns a non-empty string', () => {
    const result = describeTrend('0 * * * *', new Date('2024-01-15T12:00:00Z'));
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('includes per-day and per-week info', () => {
    const result = describeTrend('0 9 * * *', new Date('2024-01-15T12:00:00Z'));
    expect(result).toMatch(/day/);
    expect(result).toMatch(/week/);
  });
});
