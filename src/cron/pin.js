const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.env.HOME || '/tmp', '.cronview');
const PINS_FILE = path.join(DATA_DIR, 'pins.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadPins() {
  ensureDir();
  if (!fs.existsSync(PINS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(PINS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function savePins(pins) {
  ensureDir();
  fs.writeFileSync(PINS_FILE, JSON.stringify(pins, null, 2));
}

function pinExpression(expression, label = '') {
  const pins = loadPins();
  if (pins.find(p => p.expression === expression)) return pins;
  const entry = { expression, label, pinnedAt: new Date().toISOString() };
  const updated = [entry, ...pins];
  savePins(updated);
  return updated;
}

function unpinExpression(expression) {
  const pins = loadPins();
  const updated = pins.filter(p => p.expression !== expression);
  savePins(updated);
  return updated;
}

function isPinned(expression) {
  return loadPins().some(p => p.expression === expression);
}

function reorderPin(expression, newIndex) {
  const pins = loadPins();
  const idx = pins.findIndex(p => p.expression === expression);
  if (idx === -1) return pins;
  const [item] = pins.splice(idx, 1);
  pins.splice(Math.max(0, newIndex), 0, item);
  savePins(pins);
  return pins;
}

module.exports = { loadPins, savePins, pinExpression, unpinExpression, isPinned, reorderPin };
