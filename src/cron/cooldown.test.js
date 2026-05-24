const { minCooldown, maxCooldown, isUniformCooldown, cooldownSummary } = require('./cooldown');

jest.mock('./parser', () => {
  const base = new Date('2024-01-01T00:00:00Z').getTime();
  return {
    getNextRuns: jest.fn((expr, n = 20) => {
      if (expr === 'uniform') {
        return Array.from({ length: n }, (_, i) => new Date(base + i * 60_000));
      }
      if (expr === 'variable') {
        return [
          new Date(base),
          new Date(base + 60_000),
          new Date(base + 60_000 + 3600_000),
        ];
      }
      if (expr === 'single') {
        return [new Date(base)];
      }
      return [];
    }),
  };
});

describe('minCooldown', () => {
  it('returns the minimum gap in seconds for uniform expression', () => {
    expect(minCooldown('uniform')).toBe(60);
  });

  it('returns the minimum gap for variable expression', () => {
    expect(minCooldown('variable')).toBe(60);
  });

  it('returns Infinity for single run', () => {
    expect(minCooldown('single')).toBe(Infinity);
  });
});

describe('maxCooldown', () => {
  it('returns the maximum gap in seconds for uniform expression', () => {
    expect(maxCooldown('uniform')).toBe(60);
  });

  it('returns the maximum gap for variable expression', () => {
    expect(maxCooldown('variable')).toBe(3600);
  });

  it('returns 0 for single run', () => {
    expect(maxCooldown('single')).toBe(0);
  });
});

describe('isUniformCooldown', () => {
  it('returns true for uniform expression', () => {
    expect(isUniformCooldown('uniform')).toBe(true);
  });

  it('returns false for variable expression', () => {
    expect(isUniformCooldown('variable')).toBe(false);
  });
});

describe('cooldownSummary', () => {
  it('returns uniform summary for uniform expression', () => {
    expect(cooldownSummary('uniform')).toBe('Uniform cooldown: 1m');
  });

  it('returns range summary for variable expression', () => {
    expect(cooldownSummary('variable')).toBe('Cooldown range: 1m – 1h');
  });

  it('returns no data message for empty runs', () => {
    expect(cooldownSummary('empty')).toBe('No cooldown data available');
  });
});
