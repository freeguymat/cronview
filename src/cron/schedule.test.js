const { buildSchedule, findOverlappingRuns, nextRunGap, isHighFrequency } = require('./schedule');

jest.mock('./parser', () => ({
  getNextRuns: (expr, count) => {
    const base = new Date('2024-01-01T00:00:00.000Z');
    return Array.from({ length: count }, (_, i) => new Date(base.getTime() + i * 60_000));
  },
}));

jest.mock('./timezone', () => ({
  convertToTimezone: (date, tz) => date,
}));

describe('buildSchedule', () => {
  it('returns expression and timezone in result', () => {
    const result = buildSchedule('* * * * *', { count: 3, timezone: 'UTC' });
    expect(result.expression).toBe('* * * * *');
    expect(result.timezone).toBe('UTC');
  });

  it('returns correct number of runs', () => {
    const result = buildSchedule('* * * * *', { count: 4 });
    expect(result.runs).toHaveLength(4);
  });

  it('includes generatedAt timestamp', () => {
    const result = buildSchedule('0 * * * *');
    expect(typeof result.generatedAt).toBe('string');
  });

  it('defaults to 5 runs and UTC', () => {
    const result = buildSchedule('0 0 * * *');
    expect(result.runs).toHaveLength(5);
    expect(result.timezone).toBe('UTC');
  });

  it('runs are returned as Date objects', () => {
    const result = buildSchedule('* * * * *', { count: 3 });
    result.runs.forEach(run => {
      expect(run).toBeInstanceOf(Date);
    });
  });

  it('runs are in ascending order', () => {
    const result = buildSchedule('* * * * *', { count: 4 });
    for (let i = 1; i < result.runs.length; i++) {
      expect(result.runs[i].getTime()).toBeGreaterThanOrEqual(result.runs[i - 1].getTime());
    }
  });
});

describe('findOverlappingRuns', () => {
  it('finds overlapping runs when expressions share times', () => {
    // Both expressions use the same mock, so all runs overlap
    const overlaps = findOverlappingRuns('* * * * *', '* * * * *', 5);
    expect(overlaps.length).toBe(5);
  });
});

describe('nextRunGap', () => {
  it('returns gap in milliseconds between first two runs', () => {
    const gap = nextRunGap('* * * * *');
    expect(gap).toBe(60_000);
  });
});

describe('isHighFrequency', () => {
  it('returns true when gap is below threshold', () => {
    expect(isHighFrequency('* * * * *', 120_000)).toBe(true);
  });

  it('returns false when gap meets or exceeds threshold', () => {
    expect(isHighFrequency('* * * * *', 30_000)).toBe(false);
  });
});
