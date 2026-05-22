const fs = require('fs');
const path = require('path');
const os = require('os');

// Redirect favorites path for testing
const TEST_DIR = path.join(os.tmpdir(), '.cronview-test-' + Date.now());
const TEST_PATH = path.join(TEST_DIR, 'favorites.json');

jest.mock('os', () => ({
  ...jest.requireActual('os'),
  homedir: () => TEST_DIR.replace('/\.cronview.*', '') || os.tmpdir()
}));

// We'll test via direct manipulation since homedir mock is tricky
const { addFavorite, removeFavorite, listFavorites, loadFavorites } = require('./favorites');

beforeEach(() => {
  // Clean up any leftover state by removing the favorites file if it exists
  const favPath = path.join(os.homedir(), '.cronview', 'favorites.json');
  if (fs.existsSync(favPath)) fs.unlinkSync(favPath);
});

aftereAll(() => {
  const favPath = path.join(os.homedir(), '.cronview', 'favorites.json');
  if (fs.existsSync(favPath)) fs.unlinkSync(favPath);
});

describe('favorites', () => {
  test('loadFavorites returns empty array when no file exists', () => {
    const result = loadFavorites();
    expect(Array.isArray(result)).toBe(true);
  });

  test('addFavorite adds a new entry', () => {
    const result = addFavorite('0 * * * *', 'Every hour');
    expect(result.added).toBe(true);
    expect(result.entry.expression).toBe('0 * * * *');
    expect(result.entry.label).toBe('Every hour');
    expect(result.entry.addedAt).toBeDefined();
  });

  test('addFavorite uses expression as label when no label provided', () => {
    const result = addFavorite('*/5 * * * *');
    expect(result.entry.label).toBe('*/5 * * * *');
  });

  test('addFavorite prevents duplicates', () => {
    addFavorite('0 0 * * *', 'Midnight');
    const second = addFavorite('0 0 * * *', 'Midnight again');
    expect(second.added).toBe(false);
    expect(second.reason).toBe('already exists');
  });

  test('listFavorites returns all saved favorites', () => {
    addFavorite('0 * * * *', 'Hourly');
    addFavorite('0 0 * * *', 'Daily');
    const list = listFavorites();
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  test('removeFavorite removes an existing entry', () => {
    addFavorite('0 12 * * *', 'Noon');
    const result = removeFavorite('0 12 * * *');
    expect(result.removed).toBe(true);
    const list = listFavorites();
    expect(list.find(f => f.expression === '0 12 * * *')).toBeUndefined();
  });

  test('removeFavorite returns removed: false for unknown expression', () => {
    const result = removeFavorite('9 9 9 9 9');
    expect(result.removed).toBe(false);
  });
});
