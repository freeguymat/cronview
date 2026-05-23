// Manage named aliases for cron expressions
const fs = require('fs');
const path = require('path');

const ALIAS_DIR = path.join(process.env.HOME || '/tmp', '.cronview');
const ALIAS_FILE = path.join(ALIAS_DIR, 'aliases.json');

function ensureDir() {
  if (!fs.existsSync(ALIAS_DIR)) {
    fs.mkdirSync(ALIAS_DIR, { recursive: true });
  }
}

function loadAliases() {
  ensureDir();
  if (!fs.existsSync(ALIAS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(ALIAS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveAliases(aliases) {
  ensureDir();
  fs.writeFileSync(ALIAS_FILE, JSON.stringify(aliases, null, 2));
}

function setAlias(name, expression) {
  if (!name || typeof name !== 'string') throw new Error('Alias name is required');
  if (!expression || typeof expression !== 'string') throw new Error('Expression is required');
  const aliases = loadAliases();
  aliases[name.trim()] = expression.trim();
  saveAliases(aliases);
  return aliases;
}

function removeAlias(name) {
  const aliases = loadAliases();
  if (!aliases[name]) return false;
  delete aliases[name];
  saveAliases(aliases);
  return true;
}

function resolveAlias(name) {
  const aliases = loadAliases();
  return aliases[name] || null;
}

function listAliases() {
  return loadAliases();
}

function hasAlias(name) {
  const aliases = loadAliases();
  return Object.prototype.hasOwnProperty.call(aliases, name);
}

module.exports = { loadAliases, saveAliases, setAlias, removeAlias, resolveAlias, listAliases, hasAlias };
