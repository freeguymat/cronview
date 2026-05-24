const { assignPriority, comparePriority, sortByPriority, describePriority, PRIORITY_LEVELS } = require('./priority');

jest.mock('./parser', () => ({
  getNextRuns: jest.fn(),
}));

const { getNextRuns } = require('./parser');

function makeRuns(gapMinutes, count = 10) {
  const base = Date.now();
  return Array.from({ length: count }, (_, i) => base + i * gapMinutes * 60000);
}

describe('assignPriority', () => {
  it('returns critical for < 5 min gap', () => {
    getNextRuns.mockReturnValue(makeRuns(1));
    expect(assignPriority('* * * * *')).toBe('critical');
  });

  it('returns high for < 30 min gap', () => {
    getNextRuns.mockReturnValue(makeRuns(10));
    expect(assignPriority('*/10 * * * *')).toBe('high');
  });

  it('returns medium for < 360 min gap', () => {
    getNextRuns.mockReturnValue(makeRuns(60));
    expect(assignPriority('0 * * * *')).toBe('medium');
  });

  it('returns low for >= 360 min gap', () => {
    getNextRuns.mockReturnValue(makeRuns(720));
    expect(assignPriority('0 0 * * *')).toBe('low');
  });

  it('returns low when parser throws', () => {
    getNextRuns.mockImplementation(() => { throw new Error('bad'); });
    expect(assignPriority('invalid')).toBe('low');
  });

  it('returns low when fewer than 2 runs', () => {
    getNextRuns.mockReturnValue([Date.now()]);
    expect(assignPriority('* * * * *')).toBe('low');
  });
});

describe('comparePriority', () => {
  it('sorts critical before low', () => {
    getNextRuns
      .mockReturnValueOnce(makeRuns(1))
      .mockReturnValueOnce(makeRuns(1))
      .mockReturnValueOnce(makeRuns(720))
      .mockReturnValueOnce(makeRuns(720));
    expect(comparePriority('* * * * *', '0 0 * * *')).toBeLessThan(0);
  });
});

describe('sortByPriority', () => {
  it('returns a sorted array without mutating original', () => {
    getNextRuns
      .mockReturnValueOnce(makeRuns(720))
      .mockReturnValueOnce(makeRuns(720))
      .mockReturnValueOnce(makeRuns(1))
      .mockReturnValueOnce(makeRuns(1));
    const exprs = ['0 0 * * *', '* * * * *'];
    const sorted = sortByPriority(exprs);
    expect(sorted[0]).toBe('* * * * *');
    expect(exprs[0]).toBe('0 0 * * *');
  });
});

describe('describePriority', () => {
  it('includes emoji and label', () => {
    getNextRuns.mockReturnValue(makeRuns(1));
    const result = describePriority('* * * * *');
    expect(result).toContain('Critical');
    expect(result).toContain('🔴');
  });
});

describe('PRIORITY_LEVELS', () => {
  it('has four levels in order', () => {
    expect(PRIORITY_LEVELS).toEqual(['critical', 'high', 'medium', 'low']);
  });
});
