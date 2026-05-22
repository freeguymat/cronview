jest.mock('blessed', () => {
  const makeWidget = () => ({
    clearItems: jest.fn(),
    addItem: jest.fn(),
    on: jest.fn(),
    selected: 0,
  });
  return {
    box: jest.fn(() => makeWidget()),
    list: jest.fn(() => makeWidget()),
  };
});

jest.mock('../cron/timezone', () => ({
  listCommonTimezones: jest.fn(() => [
    { name: 'UTC', offset: '+00:00' },
    { name: 'America/New_York', offset: '-05:00' },
    { name: 'Asia/Tokyo', offset: '+09:00' },
  ]),
  isValidTimezone: jest.fn((tz) => tz !== 'Bad/Zone'),
}));

const { createTimezonePanel } = require('./timezonePanel');

describe('createTimezonePanel', () => {
  let screen, parent;

  beforeEach(() => {
    screen = { render: jest.fn() };
    parent = {};
  });

  it('creates panel without throwing', () => {
    expect(() => createTimezonePanel(screen, parent)).not.toThrow();
  });

  it('returns box, list, refresh, getSelectedTimezone', () => {
    const panel = createTimezonePanel(screen, parent);
    expect(panel).toHaveProperty('box');
    expect(panel).toHaveProperty('list');
    expect(panel).toHaveProperty('refresh');
    expect(panel).toHaveProperty('getSelectedTimezone');
  });

  it('populates list items on refresh', () => {
    const panel = createTimezonePanel(screen, parent);
    panel.refresh();
    expect(panel.list.addItem).toHaveBeenCalledWith(expect.stringContaining('UTC'));
    expect(panel.list.addItem).toHaveBeenCalledWith(expect.stringContaining('Asia/Tokyo'));
  });

  it('calls onSelect callback when item is selected', () => {
    const onSelect = jest.fn();
    const panel = createTimezonePanel(screen, parent, { onSelect });
    const selectHandler = panel.list.on.mock.calls.find(([e]) => e === 'select');
    expect(selectHandler).toBeDefined();
    selectHandler[1]();
    expect(onSelect).toHaveBeenCalledWith('UTC');
  });

  it('getSelectedTimezone returns UTC by default', () => {
    const panel = createTimezonePanel(screen, parent);
    expect(panel.getSelectedTimezone()).toBe('UTC');
  });
});
