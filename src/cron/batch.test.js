const { batchEvaluate, findCoincidentRuns, batchSummary } = require('./batch');

jest.mock('./parser', () => ({
  validateExpression: (expr) => {
    if (expr === 'bad') return { valid: false, error: 'invalid' };
    return { valid: true };
  },
  getNextRuns: (expr, count, from) => {
    const base = new Date(from);
    return Array.from({ length: count }, (_, i) => new Date(base.getTime() + (i + 1) * 60000));
  },
}));

describe('batchEvaluate', () => {
  it('returns valid results for good expressions', () => {
    const results = batchEvaluate(['* * * * *', '0 * * * *'], 3);
    expect(results).toHaveLength(2);
    results.forEach((r) => {
      expect(r.valid).toBe(true);
      expect(r.runs).toHaveLength(3);
    });
  });

  it('marks invalid expressions', () => {
    const results = batchEvaluate(['bad']);
    expect(results[0].valid).toBe(false);
    expect(results[0].error).toBe('invalid');
    expect(results[0].runs).toHaveLength(0);
  });

  it('handles mixed valid and invalid', () => {
    const results = batchEvaluate(['* * * * *', 'bad', '0 0 * * *']);
    expect(results[0].valid).toBe(true);
    expect(results[1].valid).toBe(false);
    expect(results[2].valid).toBe(true);
  });
});

describe('batchSummary', () => {
  it('returns correct counts', () => {
    const results = batchEvaluate(['* * * * *', 'bad', '0 0 * * *']);
    const summary = batchSummary(results);
    expect(summary.total).toBe(3);
    expect(summary.valid).toBe(2);
    expect(summary.invalid).toBe(1);
  });
});

describe('findCoincidentRuns', () => {
  it('returns an array', () => {
    const result = findCoincidentRuns(['* * * * *', '0 * * * *']);
    expect(Array.isArray(result)).toBe(true);
  });

  it('ignores invalid expressions', () => {
    const result = findCoincidentRuns(['bad', '* * * * *']);
    expect(result).toEqual([]);
  });
});
