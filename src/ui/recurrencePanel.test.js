const { createRecurrencePanel } = require('./recurrencePanel');

jest.mock('../cron/recurrence', () => ({
  describeRecurrence: jest.fn(() => ({
    pattern: 'daily',
    averageIntervalMs: 86400000,
    averageIntervalSeconds: 86400
  })),
  getRecurrencePattern: jest.fn(() => 'daily')
}));

function makeScreen() {
  return { render: jest.fn() };
}

function makeParent() {
  return {};
}

describe('createRecurrencePanel', () => {
  let screen, parent, panel;

  beforeEach(() => {
    screen = makeScreen();
    parent = makeParent();
    panel = createRecurrencePanel(screen, parent);
  });

  it('returns box and refresh', () => {
    expect(panel).toHaveProperty('box');
    expect(panel).toHaveProperty('refresh');
    expect(typeof panel.refresh).toBe('function');
  });

  it('refresh with empty expression does not throw', () => {
    expect(() => panel.refresh('')).not.toThrow();
    expect(screen.render).toHaveBeenCalled();
  });

  it('refresh with valid expression calls describeRecurrence', () => {
    const { describeRecurrence } = require('../cron/recurrence');
    panel.refresh('0 9 * * *');
    expect(describeRecurrence).toHaveBeenCalledWith('0 9 * * *');
    expect(screen.render).toHaveBeenCalled();
  });

  it('refresh handles error from describeRecurrence', () => {
    const { describeRecurrence } = require('../cron/recurrence');
    describeRecurrence.mockImplementationOnce(() => { throw new Error('parse fail'); });
    expect(() => panel.refresh('bad expr')).not.toThrow();
    expect(screen.render).toHaveBeenCalled();
  });

  it('refresh with null expression does not throw', () => {
    expect(() => panel.refresh(null)).not.toThrow();
  });

  it('refresh with undefined expression does not throw', () => {
    expect(() => panel.refresh(undefined)).not.toThrow();
  });

  it('calls screen.render on every refresh regardless of expression validity', () => {
    const { describeRecurrence } = require('../cron/recurrence');
    describeRecurrence.mockImplementationOnce(() => { throw new Error('fail'); });
    panel.refresh('bad');
    panel.refresh('0 9 * * *');
    // render should have been called at least twice
    expect(screen.render.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
