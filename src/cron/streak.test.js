const { currentStreak, longestStreak, streakSummary } = require('./streak');

const HOUR = 60 * 60 * 1000;

function makeRuns(count, intervalMs, startTs = Date.now()) {
  const runs = [];
  for (let i = 0; i < count; i++) {
    runs.push(new Date(startTs + i * intervalMs));
  }
  return runs;
}

describe('currentStreak', () => {
  test('returns 0 for empty runs', () => {
    expect(currentStreak([], HOUR)).toBe(0);
  });

  test('returns 1 for single run', () => {
    expect(currentStreak([new Date()], HOUR)).toBe(1);
  });

  test('counts consecutive runs at correct interval', () => {
    const runs = makeRuns(5, HOUR);
    expect(currentStreak(runs, HOUR)).toBe(5);
  });

  test('stops at broken interval', () => {
    const base = Date.now();
    const runs = [
      new Date(base),
      new Date(base + HOUR),
      new Date(base + 2 * HOUR),
      new Date(base + 5 * HOUR), // gap breaks streak
      new Date(base + 6 * HOUR),
    ];
    expect(currentStreak(runs, HOUR)).toBe(2);
  });

  test('allows tolerance', () => {
    const base = Date.now();
    const runs = [
      new Date(base),
      new Date(base + HOUR + 1000), // within 10% tolerance
      new Date(base + 2 * HOUR + 2000),
    ];
    expect(currentStreak(runs, HOUR)).toBe(3);
  });
});

describe('longestStreak', () => {
  test('returns 0 for empty runs', () => {
    expect(longestStreak([], HOUR)).toBe(0);
  });

  test('finds longest streak across history', () => {
    const base = Date.now();
    const runs = [
      ...makeRuns(4, HOUR, base),
      new Date(base + 4 * HOUR + 5 * HOUR), // break
      ...makeRuns(7, HOUR, base + 10 * HOUR),
    ];
    expect(longestStreak(runs, HOUR)).toBe(7);
  });
});

describe('streakSummary', () => {
  test('returns no streak label for single run', () => {
    const result = streakSummary('* * * * *', [new Date()], HOUR);
    expect(result.current).toBe(1);
    expect(result.label).toBe('Active (1 run)');
  });

  test('returns hot streak label for 10+ runs', () => {
    const runs = makeRuns(12, HOUR);
    const result = streakSummary('0 * * * *', runs, HOUR);
    expect(result.label).toMatch(/Hot streak/);
    expect(result.current).toBe(12);
  });

  test('tracks longest independently from current', () => {
    const base = Date.now();
    const runs = [
      ...makeRuns(6, HOUR, base),
      new Date(base + 6 * HOUR + 10 * HOUR),
      new Date(base + 17 * HOUR),
    ];
    const result = streakSummary('0 * * * *', runs, HOUR);
    expect(result.longest).toBeGreaterThanOrEqual(result.current);
  });
});
