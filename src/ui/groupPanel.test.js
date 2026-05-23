const blessed = require('blessed');
const { createGroupPanel } = require('./groupPanel');

jest.mock('../cron/group', () => ({
  groupByTag: jest.fn(() => ({ daily: ['0 0 * * *'], untagged: ['*/5 * * * *'] })),
  groupByFrequency: jest.fn(() => ({ 'every-5-min': ['*/5 * * * *'], 'hourly-or-less': ['0 0 * * *'] })),
  listGroups: jest.fn((g) => Object.keys(g).sort()),
}));

function makeScreen() {
  return blessed.screen({ smartCSR: true, terminal: 'xterm', dump: '/dev/null' });
}

describe('createGroupPanel', () => {
  let screen, parent;

  beforeEach(() => {
    screen = makeScreen();
    parent = blessed.box({ parent: screen, width: '100%', height: '100%' });
  });

  afterEach(() => {
    screen.destroy();
  });

  it('creates a panel with box and list', () => {
    const { box } = createGroupPanel(parent, ['0 0 * * *', '*/5 * * * *']);
    expect(box).toBeDefined();
  });

  it('defaults to tag mode', () => {
    const { getMode } = createGroupPanel(parent, ['0 0 * * *']);
    expect(getMode()).toBe('tag');
  });

  it('refresh calls groupByTag in tag mode', () => {
    const { groupByTag } = require('../cron/group');
    const { refresh } = createGroupPanel(parent, ['0 0 * * *']);
    refresh(['0 0 * * *']);
    expect(groupByTag).toHaveBeenCalled();
  });

  it('refresh accepts new expressions list', () => {
    const { groupByTag } = require('../cron/group');
    const { refresh } = createGroupPanel(parent, []);
    refresh(['0 * * * *', '0 0 * * *']);
    expect(groupByTag).toHaveBeenCalledWith(['0 * * * *', '0 0 * * *']);
  });
});
