const {
  listTemplates,
  getTemplatesByCategory,
  findTemplate,
  listCategories,
  searchTemplates,
} = require('./template');

describe('listTemplates', () => {
  it('returns an array of templates', () => {
    const templates = listTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
  });

  it('each template has name, expression, category', () => {
    listTemplates().forEach(t => {
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('expression');
      expect(t).toHaveProperty('category');
    });
  });
});

describe('getTemplatesByCategory', () => {
  it('filters by category', () => {
    const daily = getTemplatesByCategory('daily');
    expect(daily.length).toBeGreaterThan(0);
    daily.forEach(t => expect(t.category).toBe('daily'));
  });

  it('returns empty array for unknown category', () => {
    expect(getTemplatesByCategory('nonexistent')).toEqual([]);
  });
});

describe('findTemplate', () => {
  it('finds a template by exact name (case-insensitive)', () => {
    const t = findTemplate('every hour');
    expect(t).not.toBeNull();
    expect(t.expression).toBe('0 * * * *');
  });

  it('returns null for unknown name', () => {
    expect(findTemplate('not a real template')).toBeNull();
  });
});

describe('listCategories', () => {
  it('returns unique categories', () => {
    const cats = listCategories();
    expect(new Set(cats).size).toBe(cats.length);
    expect(cats).toContain('daily');
    expect(cats).toContain('weekly');
  });
});

describe('searchTemplates', () => {
  it('matches by name fragment', () => {
    const results = searchTemplates('midnight');
    expect(results.length).toBeGreaterThan(0);
  });

  it('matches by expression fragment', () => {
    const results = searchTemplates('*/5');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].expression).toContain('*/5');
  });

  it('returns empty for no match', () => {
    expect(searchTemplates('zzznomatch')).toEqual([]);
  });
});
