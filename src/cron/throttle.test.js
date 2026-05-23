const { minRunGap, isThrottled, throttleWarning, throttleSummary } = require('./throttle');

// Mock parser to control run times
jest.mock('./parser', () => ({
  getNextRuns: jest.fn(),
}));
const { getNextRuns } = require('./parser');

function makeRuns(startMs, gapMs, count) {
  return Array.from({ length: count }, (_, i) => new Date(startMs + i * gapMs).toISOString());
}

const NOW = new Date('2024-01-01T00:00:00Z').getTime();

describe('minRunGap', () => {
  it('returns Infinity for fewer than 2 runs', () => {
    getNextRuns.mockReturnValue([new Date(NOW).toISOString()]);
    expect(minRunGap('* * * * *')).toBe(Infinity);
  });

  it('returns the minimum gap between consecutive runs', () => {
    getNextRuns.mockReturnValue(makeRuns(NOW, 60_000, 5));
    expect(minRunGap('* * * * *')).toBe(60_000);
  });

  it('detects sub-minute gaps', () => {
    getNextRuns.mockReturnValue(makeRuns(NOW, 30_000, 6));
    expect(minRunGap('* * * * *')).toBe(30_000);
  });
});

describe('isThrottled', () => {
  it('returns true when gap is below threshold', () => {
    getNextRuns.mockReturnValue(makeRuns(NOW, 30_000, 6));
    expect(isThrottled('* * * * *', 60_000)).toBe(true);
  });

  it('returns false when gap meets threshold', () => {
    getNextRuns.mockReturnValue(makeRuns(NOW, 60_000, 6));
    expect(isThrottled('* * * * *', 60_000)).toBe(false);
  });
});

describe('throttleWarning', () => {
  it('returns sub-minute warning for very high frequency', () => {
    getNextRuns.mockReturnValue(makeRuns(NOW, 10_000, 6));
    const warn = throttleWarning('* * * * *');
    expect(warn).toMatch(/more than once per minute/);
  });

  it('returns high-frequency warning for 2-4 minute intervals', () => {
    getNextRuns.mockReturnValue(makeRuns(NOW, 2 * 60_000, 6));
    const warn = throttleWarning('*/2 * * * *');
    expect(warn).toMatch(/High frequency/);
  });

  it('returns null for normal frequency', () => {
    getNextRuns.mockReturnValue(makeRuns(NOW, 10 * 60_000, 6));
    expect(throttleWarning('*/10 * * * *')).toBeNull();
  });
});

describe('throttleSummary', () => {
  it('returns correct summary object', () => {
    getNextRuns.mockReturnValue(makeRuns(NOW, 30_000, 6));
    const result = throttleSummary('* * * * *');
    expect(result.throttled).toBe(true);
    expect(result.gapMs).toBe(30_000);
    expect(result.warning).toMatch(/more than once per minute/);
  });
});
