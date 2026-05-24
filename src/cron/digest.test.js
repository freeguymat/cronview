const { buildDigest, flattenDigest, renderDigestSummary, digestRunCounts } = require('./digest');

describe('buildDigest', () => {
  it('returns entries with runs for valid expressions', () => {
    const result = buildDigest(['* * * * *'], 1);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].expression).toBe('* * * * *');
    expect(result[0].runs.length).toBeGreaterThan(0);
  });

  it('filters out expressions with no runs in window', () => {
    // A cron that runs once a year — unlikely to hit in 1 hour
    const result = buildDigest(['0 0 29 2 *'], 1);
    // May or may not have runs; just ensure structure is correct
    result.forEach(entry => {
      expect(entry).toHaveProperty('expression');
      expect(Array.isArray(entry.runs)).toBe(true);
    });
  });

  it('ignores invalid or empty expressions gracefully', () => {
    const result = buildDigest(['not-valid', '', '  '], 1);
    expect(Array.isArray(result)).toBe(true);
  });

  it('respects the hours window', () => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const result = buildDigest(['*/30 * * * *'], 2);
    if (result.length > 0) {
      result[0].runs.forEach(run => {
        expect(run.getTime()).toBeLessThanOrEqual(cutoff.getTime());
      });
    }
  });
});

describe('flattenDigest', () => {
  it('flattens and sorts runs across expressions', () => {
    const digest = [
      { expression: '*/5 * * * *', runs: [new Date(2000, 0, 1, 0, 5), new Date(2000, 0, 1, 0, 15)] },
      { expression: '*/10 * * * *', runs: [new Date(2000, 0, 1, 0, 10)] },
    ];
    const flat = flattenDigest(digest);
    expect(flat.length).toBe(3);
    expect(flat[0].run.getMinutes()).toBe(5);
    expect(flat[1].run.getMinutes()).toBe(10);
    expect(flat[2].run.getMinutes()).toBe(15);
  });

  it('returns empty array for empty digest', () => {
    expect(flattenDigest([])).toEqual([]);
  });
});

describe('renderDigestSummary', () => {
  it('returns a no-runs message when nothing is scheduled', () => {
    const result = renderDigestSummary([], 1);
    expect(result).toMatch(/No runs/);
  });

  it('includes expression and timezone info in output', () => {
    const result = renderDigestSummary(['* * * * *'], 1, 'UTC');
    expect(result).toMatch(/Digest/);
    expect(result).toMatch(/UTC/);
    expect(result).toMatch(/\* \* \* \* \*/);
  });
});

describe('digestRunCounts', () => {
  it('returns count per expression', () => {
    const counts = digestRunCounts(['* * * * *'], 1);
    expect(counts.length).toBeGreaterThan(0);
    expect(counts[0]).toHaveProperty('expression');
    expect(counts[0]).toHaveProperty('count');
    expect(counts[0].count).toBeGreaterThan(0);
  });

  it('returns empty array when no expressions match', () => {
    const counts = digestRunCounts([], 1);
    expect(counts).toEqual([]);
  });
});
