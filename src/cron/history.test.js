const fs = require('fs');
const path = require('path');
const os = require('os');

// point history at a temp dir for tests
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-test-'));
process.env.HOME = tmpDir;

const {
  loadHistory,
  saveHistory,
  addToHistory,
  clearHistory,
  getRecentExpressions
} = require('./history');

describe('history', () => {
  beforeEach(() => {
    clearHistory();
  });

  test('loadHistory returns empty array when no file', () => {
    expect(loadHistory()).toEqual([]);
  });

  test('addToHistory stores an expression', () => {
    addToHistory('* * * * *');
    const history = loadHistory();
    expect(history).toHaveLength(1);
    expect(history[0].expression).toBe('* * * * *');
    expect(history[0].usedAt).toBeDefined();
  });

  test('addToHistory deduplicates and moves to front', () => {
    addToHistory('0 * * * *');
    addToHistory('* * * * *');
    addToHistory('0 * * * *');
    const history = loadHistory();
    expect(history[0].expression).toBe('0 * * * *');
    expect(history).toHaveLength(2);
  });

  test('addToHistory ignores empty/whitespace input', () => {
    addToHistory('');
    addToHistory('   ');
    expect(loadHistory()).toHaveLength(0);
  });

  test('getRecentExpressions returns strings limited by count', () => {
    addToHistory('0 0 * * *');
    addToHistory('0 12 * * 1');
    addToHistory('*/5 * * * *');
    const recent = getRecentExpressions(2);
    expect(recent).toHaveLength(2);
    expect(recent[0]).toBe('*/5 * * * *');
  });

  test('clearHistory empties the list', () => {
    addToHistory('* * * * *');
    clearHistory();
    expect(loadHistory()).toHaveLength(0);
  });
});
