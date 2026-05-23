const { chainJobs, chainGaps, describeChain } = require('./chain');

// Fixed reference point for deterministic tests
const FROM = new Date('2024-01-15T10:00:00.000Z');

describe('chainJobs', () => {
  it('returns jobs sorted by next run', () => {
    const jobs = [
      { label: 'hourly', expression: '0 * * * *' },
      { label: 'daily', expression: '0 9 * * *' },
      { label: 'every5', expression: '*/5 * * * *' },
    ];
    const chain = chainJobs(jobs, FROM);
    expect(chain.length).toBe(3);
    for (let i = 0; i < chain.length - 1; i++) {
      expect(chain[i].nextRun.getTime()).toBeLessThanOrEqual(
        chain[i + 1].nextRun.getTime()
      );
    }
  });

  it('includes nextRun date on each entry', () => {
    const jobs = [{ label: 'test', expression: '0 12 * * *' }];
    const chain = chainJobs(jobs, FROM);
    expect(chain[0].nextRun).toBeInstanceOf(Date);
    expect(chain[0].label).toBe('test');
  });

  it('returns empty array for empty input', () => {
    expect(chainJobs([], FROM)).toEqual([]);
  });
});

describe('chainGaps', () => {
  it('computes gaps between consecutive jobs', () => {
    const chain = [
      { label: 'a', expression: '*/5 * * * *', nextRun: new Date('2024-01-15T10:05:00Z') },
      { label: 'b', expression: '*/10 * * * *', nextRun: new Date('2024-01-15T10:10:00Z') },
      { label: 'c', expression: '0 * * * *', nextRun: new Date('2024-01-15T11:00:00Z') },
    ];
    const gaps = chainGaps(chain);
    expect(gaps.length).toBe(2);
    expect(gaps[0]).toMatchObject({ from: 'a', to: 'b', gapMs: 5 * 60 * 1000 });
    expect(gaps[1].gapMs).toBe(50 * 60 * 1000);
  });

  it('returns empty array for single-item chain', () => {
    const chain = [{ label: 'only', nextRun: new Date() }];
    expect(chainGaps(chain)).toEqual([]);
  });
});

describe('describeChain', () => {
  it('returns a numbered list of jobs', () => {
    const chain = [
      { label: 'first', nextRun: new Date('2024-01-15T10:05:00Z') },
      { label: 'second', nextRun: new Date('2024-01-15T11:00:00Z') },
    ];
    const desc = describeChain(chain);
    expect(desc).toContain('1. [first]');
    expect(desc).toContain('2. [second]');
  });

  it('handles empty chain', () => {
    expect(describeChain([])).toBe('No jobs in chain.');
  });
});
