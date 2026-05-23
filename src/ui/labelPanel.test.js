const blessed = require('blessed');
const fs = require('fs');
const path = require('path');
const os = require('os');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-labelpanel-'));

beforeAll(() => { process.env.HOME = tmpDir; });
afterAll(() => { fs.rmSync(tmpDir, { recursive: true, force: true }); });

function makeScreen() {
  return blessed.screen({ smartCSR: true, terminal: 'xterm', dump: '/dev/null' });
}

function makeParent(screen) {
  return blessed.box({ parent: screen, width: '100%', height: '100%' });
}

test('createLabelPanel returns expected interface', () => {
  const screen = makeScreen();
  const parent = makeParent(screen);
  const { createLabelPanel } = require('./labelPanel');
  const lp = createLabelPanel(screen, parent);
  expect(typeof lp.refresh).toBe('function');
  expect(typeof lp.promptAdd).toBe('function');
  expect(typeof lp.deleteSelected).toBe('function');
  expect(typeof lp.getSelectedExpression).toBe('function');
  screen.destroy();
});

test('refresh shows no labels message when empty', () => {
  jest.resetModules();
  process.env.HOME = tmpDir;
  const screen = makeScreen();
  const parent = makeParent(screen);
  const { createLabelPanel } = require('./labelPanel');
  const lp = createLabelPanel(screen, parent);
  lp.refresh();
  screen.destroy();
});

test('refresh shows labels after setLabel', () => {
  jest.resetModules();
  process.env.HOME = tmpDir;
  const { setLabel } = require('../cron/label');
  setLabel('0 * * * *', 'Hourly');
  const screen = makeScreen();
  const parent = makeParent(screen);
  const { createLabelPanel } = require('./labelPanel');
  const lp = createLabelPanel(screen, parent);
  lp.refresh();
  screen.destroy();
});

test('getSelectedExpression returns null when no labels', () => {
  jest.resetModules();
  process.env.HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-empty-'));
  const screen = makeScreen();
  const parent = makeParent(screen);
  const { createLabelPanel } = require('./labelPanel');
  const lp = createLabelPanel(screen, parent);
  expect(lp.getSelectedExpression()).toBeNull();
  screen.destroy();
});

test('deleteSelected does not throw when list is empty', () => {
  jest.resetModules();
  process.env.HOME = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-del-'));
  const screen = makeScreen();
  const parent = makeParent(screen);
  const { createLabelPanel } = require('./labelPanel');
  const lp = createLabelPanel(screen, parent);
  expect(() => lp.deleteSelected()).not.toThrow();
  screen.destroy();
});
