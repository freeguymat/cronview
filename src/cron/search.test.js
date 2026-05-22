import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchExpressions, filterByTag } from './search.js';

vi.mock('./favorites.js', () => ({
  loadFavorites: () => [
    { expression: '0 9 * * 1-5', label: 'Weekday morning' },
    { expression: '*/5 * * * *', label: 'Every 5 minutes' }
  ]
}));

vi.mock('./history.js', () => ({
  getRecentExpressions: () => ['0 0 * * *', '0 9 * * 1-5', '30 18 * * *']
}));

vi.mock('./tags.js', () => ({
  getTagsForExpression: (expr) => expr === '0 9 * * 1-5' ? ['work'] : []
}));

vi.mock('./notes.js', () => ({
  getNote: (expr) => expr === '*/5 * * * *' ? 'polling job' : null
}));

describe('searchExpressions', () => {
  it('returns empty array for empty query', () => {
    expect(searchExpressions('')).toEqual([]);
  });

  it('matches by expression content', () => {
    const results = searchExpressions('*/5');
    expect(results.length).toBe(1);
    expect(results[0].expression).toBe('*/5 * * * *');
  });

  it('matches by label', () => {
    const results = searchExpressions('morning');
    expect(results.length).toBe(1);
    expect(results[0].label).toBe('Weekday morning');
  });

  it('deduplicates expressions across sources', () => {
    const results = searchExpressions('1-5');
    const exprs = results.map(r => r.expression);
    const unique = new Set(exprs);
    expect(unique.size).toBe(exprs.length);
  });

  it('attaches tags and note to results', () => {
    const results = searchExpressions('*/5');
    expect(results[0].note).toBe('polling job');
  });

  it('respects includeFavorites option', () => {
    const results = searchExpressions('5 minutes', { includeFavorites: false });
    expect(results.length).toBe(0);
  });
});

describe('filterByTag', () => {
  it('returns expressions with the given tag', () => {
    const results = filterByTag('work');
    expect(results.length).toBe(1);
    expect(results[0].expression).toBe('0 9 * * 1-5');
  });

  it('returns empty array for unknown tag', () => {
    const results = filterByTag('nonexistent');
    expect(results).toEqual([]);
  });
});
