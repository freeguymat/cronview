const fs = require('fs');
const path = require('path');
const { ensureDir } = require('./favorites');

const HISTORY_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.cronview');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json');
const MAX_HISTORY = 50;

function loadHistory() {
  try {
    ensureDir(HISTORY_DIR);
    if (!fs.existsSync(HISTORY_FILE)) return [];
    const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  try {
    ensureDir(HISTORY_DIR);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2));
  } catch (err) {
    // silently fail — history is non-critical
  }
}

function addToHistory(expression) {
  if (!expression || !expression.trim()) return;
  const entries = loadHistory();
  const filtered = entries.filter(e => e.expression !== expression);
  const newEntry = {
    expression: expression.trim(),
    usedAt: new Date().toISOString()
  };
  const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
  saveHistory(updated);
  return updated;
}

function clearHistory() {
  saveHistory([]);
}

function getRecentExpressions(limit = 10) {
  const entries = loadHistory();
  return entries.slice(0, limit).map(e => e.expression);
}

module.exports = { loadHistory, saveHistory, addToHistory, clearHistory, getRecentExpressions };
