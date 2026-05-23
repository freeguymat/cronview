const fs = require('fs');
const path = require('path');

const ALIAS_FILE = path.join(process.env.HOME || '/tmp', '.cronview', 'aliases.json');

function makeScreen() {
  return {
    render: jest.fn(),
    append: jest.fn(),
  };
}

function makeParent() {
  const children = [];
  return {
    append: (c) => children.push(c),
    children,
  };
}

beforeEach(() => {
  jest.resetModules();
  if (fs.existsSync(ALIAS_FILE)) fs.unlinkSync(ALIAS_FILE);
});

afterEach(() => {
  if (fs.existsSync(ALIAS_FILE)) fs.unlinkSync(ALIAS_FILE);
});

test('createAliasPanel returns expected interface', () => {
  const blessed = require('blessed');
  const screen = blessed.screen({ smartCSR: true });
  const parent = blessed.box({ parent: screen });
  const { createAliasPanel } = require('./aliasPanel');
  const panel = createAliasPanel(screen, parent);
  expect(typeof panel.refresh).toBe('function');
  expect(typeof panel.getSelectedAlias).toBe('function');
  expect(typeof panel.promptAdd).toBe('function');
  expect(typeof panel.deleteSelected).toBe('function');
  screen.destroy();
});

test('getSelectedAlias returns null when no aliases', () => {
  const blessed = require('blessed');
  const screen = blessed.screen({ smartCSR: true });
  const parent = blessed.box({ parent: screen });
  const { createAliasPanel } = require('./aliasPanel');
  const panel = createAliasPanel(screen, parent);
  expect(panel.getSelectedAlias()).toBeNull();
  screen.destroy();
});

test('refresh shows aliases from store', () => {
  const { setAlias } = require('../cron/alias');
  setAlias('daily', '0 0 * * *');
  const blessed = require('blessed');
  const screen = blessed.screen({ smartCSR: true });
  const parent = blessed.box({ parent: screen });
  const { createAliasPanel } = require('./aliasPanel');
  const panel = createAliasPanel(screen, parent);
  panel.refresh();
  expect(panel.getSelectedAlias()).not.toBeNull();
  screen.destroy();
});

test('deleteSelected removes the selected alias', () => {
  const { setAlias, loadAliases } = require('../cron/alias');
  setAlias('weekly', '0 0 * * 0');
  const blessed = require('blessed');
  const screen = blessed.screen({ smartCSR: true });
  const parent = blessed.box({ parent: screen });
  const { createAliasPanel } = require('./aliasPanel');
  const panel = createAliasPanel(screen, parent);
  panel.list.select(0);
  panel.deleteSelected();
  expect(Object.keys(loadAliases())).toHaveLength(0);
  screen.destroy();
});
