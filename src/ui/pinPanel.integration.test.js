const blessed = require('blessed');
const fs = require('fs');
const path = require('path');
const os = require('os');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-pinint-'));
process.env.HOME = tmpDir;

beforeEach(() => {
  jest.resetModules();
  const pinsFile = path.join(tmpDir, '.cronview', 'pins.json');
  if (fs.existsSync(pinsFile)) fs.unlinkSync(pinsFile);
});

test('pin and unpin flow updates panel items', () => {
  const { createPinPanel } = require('./pinPanel');
  const screen = blessed.screen({ smartCSR: true });
  const parent = blessed.box({ parent: screen, width: '100%', height: '100%' });
  const p = createPinPanel(screen, parent);

  p.togglePin('*/10 * * * *', 'every 10 min');
  p.togglePin('0 0 * * *', 'midnight');
  p.refresh();

  const items = p.panel.items.map(i => i.content);
  expect(items.some(i => i.includes('*/10 * * * *'))).toBe(true);
  expect(items.some(i => i.includes('0 0 * * *'))).toBe(true);

  p.togglePin('*/10 * * * *');
  p.refresh();
  const after = p.panel.items.map(i => i.content);
  expect(after.some(i => i.includes('*/10 * * * *'))).toBe(false);
  expect(after.some(i => i.includes('0 0 * * *'))).toBe(true);

  screen.destroy();
});

test('moveUp reorders pins correctly', () => {
  const { createPinPanel } = require('./pinPanel');
  const { loadPins } = require('../cron/pin');
  const screen = blessed.screen({ smartCSR: true });
  const parent = blessed.box({ parent: screen, width: '100%', height: '100%' });
  const p = createPinPanel(screen, parent);

  p.togglePin('A');
  p.togglePin('B');
  p.refresh();
  p.panel.select(1);
  p.moveUp();

  const pins = loadPins();
  expect(pins[0].expression).toBe('B');
  screen.destroy();
});
