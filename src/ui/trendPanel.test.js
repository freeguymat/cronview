const blessed = require('blessed');
const { createTrendPanel } = require('./trendPanel');

function makeScreen() {
  return blessed.screen({ smartCSR: true, terminal: 'xterm', dump: '/dev/null' });
}

function makeParent(screen) {
  return blessed.box({ parent: screen, width: '100%', height: '100%' });
}

describe('createTrendPanel', () => {
  let screen, parent, panel;

  beforeEach(() => {
    screen = makeScreen();
    parent = makeParent(screen);
    panel = createTrendPanel(parent, { top: 0, left: 0, width: 40, height: 10 });
  });

  afterEach(() => {
    screen.destroy();
  });

  test('creates a box element', () => {
    expect(panel.box).toBeDefined();
  });

  test('exposes refresh and getExpression', () => {
    expect(typeof panel.refresh).toBe('function');
    expect(typeof panel.getExpression).toBe('function');
  });

  test('getExpression returns null initially', () => {
    expect(panel.getExpression()).toBeNull();
  });

  test('refresh with null sets placeholder content', () => {
    panel.refresh(null);
    expect(panel.box.getContent()).toMatch(/No expression/);
  });

  test('refresh with valid expression sets content', () => {
    const from = new Date('2024-01-15T12:00:00Z');
    panel.refresh('*/30 * * * *', from);
    const content = panel.box.getContent();
    expect(content).toMatch(/Frequency/);
    expect(content).toMatch(/Daily/);
    expect(content).toMatch(/Weekly/);
  });

  test('getExpression returns last set expression', () => {
    panel.refresh('0 9 * * *', new Date());
    expect(panel.getExpression()).toBe('0 9 * * *');
  });

  test('refresh with invalid expression shows error', () => {
    panel.refresh('INVALID_EXPR');
    const content = panel.box.getContent();
    expect(content).toMatch(/Error/);
  });
});
