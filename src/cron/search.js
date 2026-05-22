import { loadFavorites } from './favorites.js';
import { getRecentExpressions } from './history.js';
import { getTagsForExpression } from './tags.js';
import { getNote } from './notes.js';

export function searchExpressions(query, options = {}) {
  const { includeFavorites = true, includeHistory = true } = options;
  const results = [];
  const seen = new Set();

  if (!query || query.trim() === '') return results;
  const q = query.trim().toLowerCase();

  if (includeFavorites) {
    const favs = loadFavorites();
    for (const fav of favs) {
      if (!seen.has(fav.expression) && matchesQuery(fav.expression, fav.label, q)) {
        seen.add(fav.expression);
        results.push({ expression: fav.expression, label: fav.label || '', source: 'favorite' });
      }
    }
  }

  if (includeHistory) {
    const history = getRecentExpressions(50);
    for (const expression of history) {
      if (!seen.has(expression) && matchesQuery(expression, '', q)) {
        seen.add(expression);
        results.push({ expression, label: '', source: 'history' });
      }
    }
  }

  return results.map(r => ({
    ...r,
    tags: getTagsForExpression(r.expression),
    note: getNote(r.expression) || ''
  }));
}

function matchesQuery(expression, label, query) {
  return (
    expression.toLowerCase().includes(query) ||
    (label && label.toLowerCase().includes(query))
  );
}

export function filterByTag(tag) {
  const favs = loadFavorites();
  const history = getRecentExpressions(50);
  const all = [
    ...favs.map(f => f.expression),
    ...history
  ];
  const seen = new Set();
  return all
    .filter(expr => {
      if (seen.has(expr)) return false;
      seen.add(expr);
      return getTagsForExpression(expr).includes(tag);
    })
    .map(expression => ({ expression, tags: getTagsForExpression(expression) }));
}
