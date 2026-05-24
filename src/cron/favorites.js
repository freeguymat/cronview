/**
 * Favorites module — save, load, and manage favorite cron expressions
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const FAVORITES_PATH = path.join(os.homedir(), '.cronview', 'favorites.json');

function ensureDir() {
  const dir = path.dirname(FAVORITES_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadFavorites() {
  try {
    ensureDir();
    if (!fs.existsSync(FAVORITES_PATH)) return [];
    const raw = fs.readFileSync(FAVORITES_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  ensureDir();
  fs.writeFileSync(FAVORITES_PATH, JSON.stringify(favorites, null, 2), 'utf8');
}

function addFavorite(expression, label = '') {
  const favorites = loadFavorites();
  const exists = favorites.find(f => f.expression === expression);
  if (exists) return { added: false, reason: 'already exists' };
  const entry = {
    expression,
    label: label || expression,
    addedAt: new Date().toISOString()
  };
  favorites.push(entry);
  saveFavorites(favorites);
  return { added: true, entry };
}

function removeFavorite(expression) {
  const favorites = loadFavorites();
  const next = favorites.filter(f => f.expression !== expression);
  if (next.length === favorites.length) return { removed: false };
  saveFavorites(next);
  return { removed: true };
}

function listFavorites() {
  return loadFavorites();
}

/**
 * Update the label of an existing favorite by expression.
 * Returns { updated: true, entry } on success, or { updated: false, reason } if not found.
 */
function updateFavoriteLabel(expression, newLabel) {
  const favorites = loadFavorites();
  const entry = favorites.find(f => f.expression === expression);
  if (!entry) return { updated: false, reason: 'not found' };
  entry.label = newLabel;
  saveFavorites(favorites);
  return { updated: true, entry };
}

module.exports = { addFavorite, removeFavorite, listFavorites, loadFavorites, updateFavoriteLabel };
