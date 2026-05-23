const fs = require('fs');
const path = require('path');

const ALIAS_FILE = path.join(process.env.HOME || '/tmp', '.cronview', 'aliases.json');

let mod;

beforeEach(() => {
  jest.resetModules();
  if (fs.existsSync(ALIAS_FILE)) fs.unlinkSync(ALIAS_FILE);
  mod = require('./alias');
});

afterEach(() => {
  if (fs.existsSync(ALIAS_FILE)) fs.unlinkSync(ALIAS_FILE);
});

test('loadAliases returns empty object when no file', () => {
  expect(mod.loadAliases()).toEqual({});
});

test('setAlias stores an alias', () => {
  mod.setAlias('daily', '0 0 * * *');
  expect(mod.loadAliases()).toEqual({ daily: '0 0 * * *' });
});

test('setAlias overwrites existing alias', () => {
  mod.setAlias('daily', '0 0 * * *');
  mod.setAlias('daily', '0 12 * * *');
  expect(mod.resolveAlias('daily')).toBe('0 12 * * *');
});

test('setAlias throws on missing name', () => {
  expect(() => mod.setAlias('', '0 0 * * *')).toThrow();
});

test('setAlias throws on missing expression', () => {
  expect(() => mod.setAlias('daily', '')).toThrow();
});

test('removeAlias deletes an alias', () => {
  mod.setAlias('hourly', '0 * * * *');
  const result = mod.removeAlias('hourly');
  expect(result).toBe(true);
  expect(mod.resolveAlias('hourly')).toBeNull();
});

test('removeAlias returns false for non-existent alias', () => {
  expect(mod.removeAlias('ghost')).toBe(false);
});

test('resolveAlias returns null for unknown alias', () => {
  expect(mod.resolveAlias('nope')).toBeNull();
});

test('listAliases returns all aliases', () => {
  mod.setAlias('a', '* * * * *');
  mod.setAlias('b', '0 0 * * 1');
  const list = mod.listAliases();
  expect(list).toHaveProperty('a');
  expect(list).toHaveProperty('b');
});

test('hasAlias returns true when alias exists', () => {
  mod.setAlias('weekly', '0 0 * * 0');
  expect(mod.hasAlias('weekly')).toBe(true);
});

test('hasAlias returns false when alias missing', () => {
  expect(mod.hasAlias('missing')).toBe(false);
});
