const fs = require('fs');
const path = require('path');
const os = require('os');

let mod;
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-pin-'));

beforeEach(() => {
  jest.resetModules();
  process.env.HOME = tmpDir;
  mod = require('./pin');
  const pinsFile = path.join(tmpDir, '.cronview', 'pins.json');
  if (fs.existsSync(pinsFile)) fs.unlinkSync(pinsFile);
});

test('loadPins returns empty array when no file', () => {
  expect(mod.loadPins()).toEqual([]);
});

test('pinExpression adds entry', () => {
  const pins = mod.pinExpression('0 9 * * 1-5', 'weekday morning');
  expect(pins).toHaveLength(1);
  expect(pins[0].expression).toBe('0 9 * * 1-5');
  expect(pins[0].label).toBe('weekday morning');
});

test('pinExpression does not duplicate', () => {
  mod.pinExpression('0 9 * * *');
  const pins = mod.pinExpression('0 9 * * *');
  expect(pins).toHaveLength(1);
});

test('unpinExpression removes entry', () => {
  mod.pinExpression('0 9 * * *');
  const pins = mod.unpinExpression('0 9 * * *');
  expect(pins).toHaveLength(0);
});

test('isPinned returns correct boolean', () => {
  mod.pinExpression('*/5 * * * *');
  expect(mod.isPinned('*/5 * * * *')).toBe(true);
  expect(mod.isPinned('0 0 * * *')).toBe(false);
});

test('reorderPin moves item to new index', () => {
  mod.pinExpression('A');
  mod.pinExpression('B');
  mod.pinExpression('C');
  const pins = mod.reorderPin('C', 0);
  expect(pins[0].expression).toBe('C');
  expect(pins[1].expression).toBe('B');
});

test('reorderPin ignores unknown expression', () => {
  mod.pinExpression('A');
  const pins = mod.reorderPin('Z', 0);
  expect(pins).toHaveLength(1);
});
