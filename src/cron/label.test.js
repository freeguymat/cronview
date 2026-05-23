const fs = require('fs');
const path = require('path');
const os = require('os');

let loadLabels, saveLabels, setLabel, getLabel, removeLabel, listLabels, hasLabel;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-label-test-'));

beforeEach(() => {
  jest.resetModules();
  process.env.HOME = tmpDir;
  ({ loadLabels, saveLabels, setLabel, getLabel, removeLabel, listLabels, hasLabel } =
    require('./label'));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadLabels returns empty object when no file', () => {
  expect(loadLabels()).toEqual({});
});

test('setLabel stores a label', () => {
  setLabel('0 * * * *', 'Every Hour');
  expect(getLabel('0 * * * *')).toBe('Every Hour');
});

test('setLabel trims whitespace', () => {
  setLabel('0 0 * * *', '  Daily  ');
  expect(getLabel('0 0 * * *')).toBe('Daily');
});

test('setLabel throws without expression', () => {
  expect(() => setLabel(null, 'label')).toThrow();
});

test('setLabel throws without label', () => {
  expect(() => setLabel('0 * * * *', '')).toThrow();
});

test('getLabel returns null for unknown expression', () => {
  expect(getLabel('9 9 9 9 9')).toBeNull();
});

test('removeLabel removes existing label', () => {
  setLabel('0 6 * * *', 'Morning');
  expect(removeLabel('0 6 * * *')).toBe(true);
  expect(getLabel('0 6 * * *')).toBeNull();
});

test('removeLabel returns false for unknown expression', () => {
  expect(removeLabel('1 2 3 4 5')).toBe(false);
});

test('listLabels returns all labels', () => {
  setLabel('0 * * * *', 'Hourly');
  setLabel('0 0 * * *', 'Daily');
  const all = listLabels();
  expect(all['0 * * * *']).toBe('Hourly');
  expect(all['0 0 * * *']).toBe('Daily');
});

test('hasLabel returns true when label exists', () => {
  setLabel('*/5 * * * *', 'Every 5 min');
  expect(hasLabel('*/5 * * * *')).toBe(true);
});

test('hasLabel returns false when no label', () => {
  expect(hasLabel('0 3 * * 0')).toBe(false);
});
