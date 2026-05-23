const fs = require('fs');
const path = require('path');
const os = require('os');

let snapshot;
const tmpDir = path.join(os.tmpdir(), 'cronview-snapshot-test-' + Date.now());

beforeEach(() => {
  process.env.HOME = tmpDir;
  jest.resetModules();
  snapshot = require('./snapshot');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('createSnapshot saves a snapshot file', () => {
  const result = snapshot.createSnapshot('daily', '0 9 * * *', 3);
  expect(result.name).toBe('daily');
  expect(result.expression).toBe('0 9 * * *');
  expect(result.runs).toHaveLength(3);
  expect(result.createdAt).toBeDefined();
});

test('getSnapshot returns saved snapshot', () => {
  snapshot.createSnapshot('weekly', '0 10 * * 1', 2);
  const loaded = snapshot.getSnapshot('weekly');
  expect(loaded).not.toBeNull();
  expect(loaded.expression).toBe('0 10 * * 1');
  expect(loaded.runs).toHaveLength(2);
});

test('getSnapshot returns null for missing snapshot', () => {
  const result = snapshot.getSnapshot('nonexistent');
  expect(result).toBeNull();
});

test('loadSnapshots returns all saved snapshots', () => {
  snapshot.createSnapshot('a', '0 1 * * *', 1);
  snapshot.createSnapshot('b', '0 2 * * *', 1);
  const all = snapshot.loadSnapshots();
  expect(all.length).toBe(2);
  const names = all.map(s => s.name);
  expect(names).toContain('a');
  expect(names).toContain('b');
});

test('deleteSnapshot removes the file', () => {
  snapshot.createSnapshot('temp', '*/5 * * * *', 1);
  const deleted = snapshot.deleteSnapshot('temp');
  expect(deleted).toBe(true);
  expect(snapshot.getSnapshot('temp')).toBeNull();
});

test('deleteSnapshot returns false for missing snapshot', () => {
  const result = snapshot.deleteSnapshot('ghost');
  expect(result).toBe(false);
});
