const { groupBy, groupByTag, groupByFrequency, listGroups, flattenGroups } = require('./group');

jest.mock('./tags', () => ({
  getTagsForExpression: jest.fn((expr) => {
    if (expr === '0 * * * *') return ['hourly'];
    if (expr === '0 0 * * *') return ['daily', 'backup'];
    return [];
  }),
}));

describe('groupBy', () => {
  it('groups expressions by a key function', () => {
    const exprs = ['0 * * * *', '0 0 * * *', '*/5 * * * *'];
    const result = groupBy(exprs, (e) => e.split(' ')[0]);
    expect(result['0']).toEqual(['0 * * * *', '0 0 * * *']);
    expect(result['*/5']).toEqual(['*/5 * * * *']);
  });

  it('returns empty object for empty input', () => {
    expect(groupBy([], () => 'key')).toEqual({});
  });
});

describe('groupByTag', () => {
  it('groups by first tag', () => {
    const exprs = ['0 * * * *', '0 0 * * *', '*/5 * * * *'];
    const result = groupByTag(exprs);
    expect(result['hourly']).toContain('0 * * * *');
    expect(result['daily']).toContain('0 0 * * *');
    expect(result['untagged']).toContain('*/5 * * * *');
  });
});

describe('groupByFrequency', () => {
  it('groups every-minute expressions', () => {
    const result = groupByFrequency(['* * * * *']);
    expect(result['every-minute']).toEqual(['* * * * *']);
  });

  it('groups every-5-min expressions', () => {
    const result = groupByFrequency(['*/5 * * * *']);
    expect(result['every-5-min']).toEqual(['*/5 * * * *']);
  });

  it('groups hourly-or-less for fixed minute', () => {
    const result = groupByFrequency(['0 * * * *']);
    expect(result['hourly-or-less']).toEqual(['0 * * * *']);
  });

  it('marks invalid expressions', () => {
    const result = groupByFrequency(['bad']);
    expect(result['invalid']).toEqual(['bad']);
  });
});

describe('listGroups', () => {
  it('returns sorted keys', () => {
    const grouped = { b: [], a: [], c: [] };
    expect(listGroups(grouped)).toEqual(['a', 'b', 'c']);
  });
});

describe('flattenGroups', () => {
  it('flattens all groups into one array', () => {
    const grouped = { a: ['x', 'y'], b: ['z'] };
    expect(flattenGroups(grouped)).toEqual(expect.arrayContaining(['x', 'y', 'z']));
  });
});
