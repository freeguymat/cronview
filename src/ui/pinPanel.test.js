const blessed = require('blessed');
const fs = require('fs');
const path = require('path');
const os = require('os');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-pinpanel-'));
process.env.HOME = tmpDir;

function makeScreen() {
  return blessed.screen({ smartCSR: true, title: 'test' });
}

function makeParent(screen) {
  return blessed.box({ parent: screen, width: '100%', height: '100%' });
}

beforeEach(() => {
  jest.resetModules();
  const pinsFile = path.join(tmpDir, '.cronview', 'pins.json');
  if (fs.existsSync(pinsFile)) fs.unlinkSync(pinsFile);
});

test('createPinPanel returns expected interface', () => {
  const { createPinPanel } = require('./pinPanel');
  const screen = makeScreen();
  const parent = makeParent(screen);
  const p = createPinPanel(screen, parent);
  expect(typeof p.refresh).toBe('function');
  expect(typeof p.getSelectedExpression).toBe('function');
  expect(typeof p.togglePin).toBe('function');
  screen.destroy();
});

test('getSelectedExpression returns null when no pins', () => {
  const { createPinPanel } = require('./pinPanel');
  const screen = makeScreen();
  const parent = makeParent(screen);
  const p = createPinPanel(screen, parent);
  expect(p.getSelectedExpression()).toBeNull();
  screen.destroy();
});

test('togglePin adds and removes pin', () => {
  const { createPinPanel } = require('./pinPanel');
  const { loadPins } = require('../cron/pin');
  const screen = makeScreen();
  const parent = makeParent(screen);
  const p = createPinPanel(screen, parent);
  p.togglePin('0 9 * * *', 'morning');
  expect(loadPins()).toHaveLength(1);
  p.togglePin('0 9 * * *');
  expect(loadPins()).toHaveLength(0);
  screen.destroy();
});

test('refresh shows placeholder when no pins', () => {
  const { createPinPanel } = require('./pinPanel');
  const screen = makeScreen();
  const parent = makeParent(screen);
  const p = createPinPanel(screen, parent);
  p.refresh();
  const items = p.panel.items.map(i => i.content);
  expect(items[0]).toContain('No pinned');
  screen.destroy();
});
