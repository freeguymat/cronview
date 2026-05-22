const { diffExpressions, describeDiff, expressionsAreEquivalent } = require('./diff');

jest.mock('./parser', () => ({
  getNextRuns: jest.fn((expr, count) => {
    const base = new Date('2024-01-01T00:00:00Z');
    if (expr === '0 * * * *') {
      return Array.from({ length: count }, (_, i) => new Date(base.getTime() + i * 3600000));
    }
    if (expr === '30 * * * *') {
      return Array.from({ length: count }, (_, i) => new Date(base.getTime() + 1800000 + i * 3600000));
    }
    if (expr === '0 * * * *_dup') {
      return Array.from({ length: count }, (_, i) => new Date(base.getTime() + i * 3600000));
    }
    return [];
  }),
}));

describe('diffExpressions', () => {
  it('returns no shared runs for non-overlapping expressions', () => {
    const result = diffExpressions('0 * * * *', '30 * * * *', 3);
    expect(result.shared).toHaveLength(0);
    expect(result.onlyInA).toHaveLength(3);
    expect(result.onlyInB).toHaveLength(3);
  });

  it('returns all shared for identical timestamps', () => {
    const result = diffExpressions('0 * * * *', '0 * * * *', 5);
    expect(result.shared).toHaveLength(5);
    expect(result.onlyInA).toHaveLength(0);
    expect(result.onlyInB).toHaveLength(0);
  });
});

describe('describeDiff', () => {
  it('returns a multi-line string', () => {
    const result = describeDiff('0 * * * *', '30 * * * *', 2);
    expect(result).toContain('Comparing:');
    expect(result).toContain('Shared runs');
    expect(result).toContain('Only in A');
    expect(result).toContain('Only in B');
  });
});

describe('expressionsAreEquivalent', () => {
  it('returns true for identical expressions', () => {
    expect(expressionsAreEquivalent('0 * * * *', '0 * * * *', 5)).toBe(true);
  });

  it('returns false for different expressions', () => {
    expect(expressionsAreEquivalent('0 * * * *', '30 * * * *', 3)).toBe(false);
  });
});
