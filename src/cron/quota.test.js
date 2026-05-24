const { countRunsInHours, checkQuota, quotaSummary, suggestQuota } = require('./quota');
const parser = require('./parser');

jest.mock('./parser');

function makeRuns(count) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) =>
    new Date(now + (i + 1) * 60 * 1000).toISOString()
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('countRunsInHours', () => {
  it('counts runs within the window', () => {
    parser.getNextRuns.mockReturnValue(makeRuns(10));
    const count = countRunsInHours('* * * * *', 1);
    expect(count).toBe(10);
  });

  it('returns 0 when no runs returned', () => {
    parser.getNextRuns.mockReturnValue([]);
    expect(countRunsInHours('0 0 * * *', 1)).toBe(0);
  });
});

describe('checkQuota', () => {
  it('reports exceeded when count > maxRuns', () => {
    parser.getNextRuns.mockReturnValue(makeRuns(15));
    const result = checkQuota('* * * * *', 10, 1);
    expect(result.exceeded).toBe(true);
    expect(result.count).toBe(15);
    expect(result.maxRuns).toBe(10);
  });

  it('reports ok when count <= maxRuns', () => {
    parser.getNextRuns.mockReturnValue(makeRuns(5));
    const result = checkQuota('*/12 * * * *', 10, 1);
    expect(result.exceeded).toBe(false);
    expect(result.count).toBe(5);
  });

  it('defaults windowHours to 24', () => {
    parser.getNextRuns.mockReturnValue(makeRuns(3));
    const result = checkQuota('0 * * * *', 5);
    expect(result.windowHours).toBe(24);
  });
});

describe('quotaSummary', () => {
  it('includes EXCEEDED when over limit', () => {
    parser.getNextRuns.mockReturnValue(makeRuns(20));
    const s = quotaSummary('* * * * *', 10, 1);
    expect(s).toMatch(/EXCEEDED/);
    expect(s).toMatch(/20\/10/);
  });

  it('includes OK when within limit', () => {
    parser.getNextRuns.mockReturnValue(makeRuns(3));
    const s = quotaSummary('0 0 * * *', 10, 24);
    expect(s).toMatch(/OK/);
  });
});

describe('suggestQuota', () => {
  it('suggests 20% above observed count', () => {
    parser.getNextRuns.mockReturnValue(makeRuns(10));
    expect(suggestQuota('* * * * *', 1)).toBe(12);
  });

  it('returns minimum of 1', () => {
    parser.getNextRuns.mockReturnValue([]);
    expect(suggestQuota('0 0 31 2 *', 24)).toBe(1);
  });
});
