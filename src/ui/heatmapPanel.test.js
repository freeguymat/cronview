import blessed from 'blessed';
import { createHeatmapPanel } from './heatmapPanel.js';

function makeScreen() {
  return blessed.screen({ smartCSR: true, terminal: 'xterm', output: process.stdout });
}

function makeParent(screen) {
  return blessed.box({ parent: screen, width: '100%', height: '100%' });
}

describe('createHeatmapPanel', () => {
  let screen, parent, panel;

  beforeEach(() => {
    screen = makeScreen();
    parent = makeParent(screen);
    panel = createHeatmapPanel(parent, screen);
  });

  afterEach(() => {
    screen.destroy();
  });

  test('returns box, refresh, toggleMode, getMode', () => {
    expect(panel.box).toBeDefined();
    expect(typeof panel.refresh).toBe('function');
    expect(typeof panel.toggleMode).toBe('function');
    expect(typeof panel.getMode).toBe('function');
  });

  test('initial mode is hourly', () => {
    expect(panel.getMode()).toBe('hourly');
  });

  test('toggleMode switches to daily', () => {
    panel.toggleMode();
    expect(panel.getMode()).toBe('daily');
  });

  test('toggleMode wraps back to hourly', () => {
    panel.toggleMode();
    panel.toggleMode();
    expect(panel.getMode()).toBe('hourly');
  });

  test('refresh with no expression shows placeholder', () => {
    panel.refresh(null);
    expect(panel.box.getContent()).toContain('No expression set');
  });

  test('refresh with valid expression renders chart', () => {
    panel.refresh('* * * * *');
    const content = panel.box.getContent();
    expect(content).toContain('* * * * *');
    expect(content).toContain('hourly');
  });

  test('refresh with invalid expression shows error', () => {
    panel.refresh('not-a-cron');
    const content = panel.box.getContent();
    expect(content).toContain('Invalid expression');
  });

  test('refresh reuses last expression when called without arg', () => {
    panel.refresh('0 * * * *');
    panel.refresh();
    expect(panel.box.getContent()).toContain('0 * * * *');
  });
});
