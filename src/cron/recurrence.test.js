const { isRecurring, getRecurrencePattern, averageInterval, describeRecurrence } = require('./recurrence');

jest.mock('./parser', () => ({
  getNextRuns: jest.fn((expr, n) => {
    const base = new Date('2024-01-01T00:00:00Z').getTime();
    const interval = expr.includes('*') ? 60000 : 3600000;
    return Array.from({ length: n }, (_, i) => new Date(base + i * interval).toISOString());
  })
}));

describe('isRecurring', () => {
  it('returns true for wildcard expressions', () => {
    expect(isRecurring('* * * * *')).toBe(true);
  });

  it('returns false when parser throws', () => {
    const { getNextRuns } = require('./parser');
    getNextRuns.mockImplementationOnce(() => { throw new Error('bad'); });
    expect(isRecurring('bad expr')).toBe(false);
  });
});

describe('getRecurrencePattern', () => {
  it('detects minutely', () => expect(getRecurrencePattern('* * * * *')).toBe('minutely'));
  it('detects hourly', () => expect(getRecurrencePattern('0 * * * *')).toBe('hourly'));
  it('detects daily', () => expect(getRecurrencePattern('0 9 * * *')).toBe('daily'));
  it('detects weekly', () => expect(getRecurrencePattern('0 9 * * 1')).toBe('weekly'));
  it('detects monthly', () => expect(getRecurrencePattern('0 9 1 * *')).toBe('monthly'));
  it('detects yearly', () => expect(getRecurrencePattern('0 9 1 1 *')).toBe('yearly'));
  it('returns unknown for bad format', () => expect(getRecurrencePattern('bad')).toBe('unknown'));
});

describe('averageInterval', () => {
  it('returns a number', () => {
    const result = averageInterval('* * * * *', 3);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });
});

describe('describeRecurrence', () => {
  it('returns pattern and interval info', () => {
    const result = describeRecurrence('* * * * *');
    expect(result).toHaveProperty('pattern');
    expect(result).toHaveProperty('averageIntervalMs');
    expect(result).toHaveProperty('averageIntervalSeconds');
  });
});
