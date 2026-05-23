// Label expressions with custom display names
const fs = require('fs');
const path = require('path');

const LABELS_DIR = path.join(process.env.HOME || '/tmp', '.cronview');
const LABELS_FILE = path.join(LABELS_DIR, 'labels.json');

function ensureDir() {
  if (!fs.existsSync(LABELS_DIR)) {
    fs.mkdirSync(LABELS_DIR, { recursive: true });
  }
}

function loadLabels() {
  ensureDir();
  if (!fs.existsSync(LABELS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(LABELS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveLabels(labels) {
  ensureDir();
  fs.writeFileSync(LABELS_FILE, JSON.stringify(labels, null, 2));
}

function setLabel(expression, label) {
  if (!expression || !label) throw new Error('expression and label are required');
  const labels = loadLabels();
  labels[expression] = label.trim();
  saveLabels(labels);
  return labels[expression];
}

function getLabel(expression) {
  if (!expression) return null;
  const labels = loadLabels();
  return labels[expression] || null;
}

function removeLabel(expression) {
  const labels = loadLabels();
  if (!labels[expression]) return false;
  delete labels[expression];
  saveLabels(labels);
  return true;
}

function listLabels() {
  return loadLabels();
}

function hasLabel(expression) {
  return getLabel(expression) !== null;
}

module.exports = { loadLabels, saveLabels, setLabel, getLabel, removeLabel, listLabels, hasLabel };
