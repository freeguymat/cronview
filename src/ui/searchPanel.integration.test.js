import { describe, it, expect, vi } from 'vitest';
import { searchExpressions } from '../cron/search.js';
import { loadFavorites } from '../cron/favorites.js';
import { getRecentExpressions } from '../cron/history.js';
import { getTagsForExpression } from '../cron/tags.js';
import { getNote } from '../cron/notes.js';

vi.mock('../cron/favorites.js', () => ({
  loadFavorites: () => [
    { expression: '0 0 1 * *', label: 'Monthly reset' }
  ]
}));

vi.mock('../cron/history.js', () => ({
  getRecentExpressions: () => ['0 0 1 * *', '*/10 * * * *']
}));

vi.mock('../cron/tags.js', () => ({
  getTagsForExpression: () => []
}));

vi.mock('../cron/notes.js', () => ({
  getNote: () => null
}));

describe('search integration', () => {
  it('combines favorites and history without duplicates', () => {
    const results = searchExpressions('0 0 1');
    const exprs = results.map(r => r.expression);
    expect(exprs.filter(e => e === '0 0 1 * *').length).toBe(1);
  });

  it('favorite source takes priority over history', () => {
    const results = searchExpressions('0 0 1');
    const match = results.find(r => r.expression === '0 0 1 * *');
    expect(match.source).toBe('favorite');
  });

  it('history-only expressions appear as history source', () => {
    const results = searchExpressions('*/10');
    expect(results[0].source).toBe('history');
  });

  it('returns empty for no match', () => {
    const results = searchExpressions('zzznomatch');
    expect(results).toEqual([]);
  });
});
