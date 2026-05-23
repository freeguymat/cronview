const fs = require('fs');
const path = require('path');
const { getNextRuns } = require('./parser');

const SNAPSHOT_DIR = path.join(process.env.HOME || '/tmp', '.cronview', 'snapshots');

function ensureDir() {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
}

function snapshotPath(name) {
  return path.join(SNAPSHOT_DIR, `${name}.json`);
}

function loadSnapshots() {
  ensureDir();
  const files = fs.readdirSync(SNAPSHOT_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    try {
      const raw = fs.readFileSync(path.join(SNAPSHOT_DIR, f), 'utf8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

function saveSnapshot(name, expression, runs) {
  ensureDir();
  const snapshot = {
    name,
    expression,
    runs: runs.map(d => d.toISOString()),
    createdAt: new Date().toISOString()
  };
  fs.writeFileSync(snapshotPath(name), JSON.stringify(snapshot, null, 2));
  return snapshot;
}

function createSnapshot(name, expression, count = 5) {
  const runs = getNextRuns(expression, count);
  return saveSnapshot(name, expression, runs);
}

function deleteSnapshot(name) {
  const p = snapshotPath(name);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    return true;
  }
  return false;
}

function getSnapshot(name) {
  const p = snapshotPath(name);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

module.exports = { loadSnapshots, createSnapshot, deleteSnapshot, getSnapshot, saveSnapshot };
