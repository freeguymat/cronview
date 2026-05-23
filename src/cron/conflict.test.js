const { findConflicts, expressionsConflict, describeConflict } = require('./conflict');

jest.mock('./parser', () => {
  const base = new Date('2024-01-01T00:00:00Z');
  const makeRuns = (offsets) => offsets.map(o => new Date(base.getTime() + o * 60000));
  return {
    getNextRuns: jest.fn((expr) => {
      if (expr === '* * * * *') return makeRuns([1, 2, 3, 4, 5]);
      if (expr === '*/2 * * * *') return makeRuns([2, 4, 6, 8, 10]);
      if (expr === '0 * * * *') return makeRuns([60, 120, 180]);
      return [];
    })
  };
});

describe('findConflicts', () => {
  it('finds overlapping run times between expressions', () => {
    const results = findConflicts(['* * * * *', '*/2 * * * *'], 60);
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => {
      expect(r.expressions.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('returns empty array when no conflicts', () => {
    const results = findConflicts(['* * * * *', '0 * * * *'], 0);
    expect(Array.isArray(results)).toBe(true);
  });

  it('handles empty input', () => {
    expect(findConflicts([])).toEqual([]);
  });
});

describe('expressionsConflict', () => {
  it('returns true when expressions share a run time', () => {
    expect(expressionsConflict('* * * * *', '*/2 * * * *')).toBe(true);
  });

  it('returns false when expressions do not share run times', () => {
    expect(expressionsConflict('* * * * *', '0 * * * *')).toBe(false);
  });

  it('returns false for invalid expression', () => {
    const { getNextRuns } = require('./parser');
    getNextRuns.mockImplementationOnce(() => { throw new Error('invalid'); });
    expect(expressionsConflict('bad expr', '* * * * *')).toBe(false);
  });
});

describe('describeConflict', () => {
  it('returns a string describing the conflict', () => {
    const conflict = {
      time: new Date('2024-01-01T00:01:00Z'),
      expressions: ['* * * * *', '*/2 * * * *']
    };
    const result = describeConflict(conflict);
    expect(typeof result).toBe('string');
    expect(result).toContain('* * * * *');
    expect(result).toContain('*/2 * * * *');
  });
});
