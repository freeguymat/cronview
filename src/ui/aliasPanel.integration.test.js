const fs = require('fs');
const path = require('path');

const ALIAS_FILE = path.join(process.env.HOME || '/tmp', '.cronview', 'aliases.json');

beforeEach(() => {
  jest.resetModules();
  if (fs.existsSync(ALIAS_FILE)) fs.unlinkSync(ALIAS_FILE);
});

afterEach(() => {
  if (fs.existsSync(ALIAS_FILE)) fs.unlinkSync(ALIAS_FILE);
});

test('add and retrieve alias through panel', () => {
  const { setAlias } = require('../cron/alias');
  setAlias('midnight', '0 0 * * *');
  setAlias('hourly', '0 * * * *');

  const blessed = require('blessed');
  const screen = blessed.screen({ smartCSR: true });
  const parent = blessed.box({ parent: screen });
  const { createAliasPanel } = require('./aliasPanel');
  const panel = createAliasPanel(screen, parent);

  panel.list.select(0);
  const sel = panel.getSelectedAlias();
  expect(sel).not.toBeNull();
  expect(typeof sel.name).toBe('string');
  expect(typeof sel.expression).toBe('string');
  screen.destroy();
});

test('delete alias updates panel list', () => {
  const { setAlias, loadAliases } = require('../cron/alias');
  setAlias('a1', '* * * * 1');
  setAlias('a2', '* * * * 2');

  const blessed = require('blessed');
  const screen = blessed.screen({ smartCSR: true });
  const parent = blessed.box({ parent: screen });
  const { createAliasPanel } = require('./aliasPanel');
  const panel = createAliasPanel(screen, parent);

  panel.list.select(0);
  panel.deleteSelected();

  const remaining = Object.keys(loadAliases());
  expect(remaining).toHaveLength(1);
  screen.destroy();
});

test('panel shows no aliases message when empty', () => {
  const blessed = require('blessed');
  const screen = blessed.screen({ smartCSR: true });
  const parent = blessed.box({ parent: screen });
  const { createAliasPanel } = require('./aliasPanel');
  const panel = createAliasPanel(screen, parent);
  expect(panel.getSelectedAlias()).toBeNull();
  screen.destroy();
});
