const { createRecurrencePanel } = require('./recurrencePanel');
const { describeRecurrence } = require('../cron/recurrence');

jest.mock('../cron/recurrence', () => ({
  describeRecurrence: jest.fn(),
  getRecurrencePattern: jest.fn()
}));

function makeScreen() {
  return { render: jest.fn() };
}

describe('recurrencePanel integration', () => {
  it('shows minutely pattern with short interval', () => {
    describeRecurrence.mockReturnValue({
      pattern: 'minutely',
      averageIntervalMs: 60000,
      averageIntervalSeconds: 60
    });
    const screen = makeScreen();
    const panel = createRecurrencePanel(screen, {});
    panel.refresh('* * * * *');
    expect(screen.render).toHaveBeenCalled();
  });

  it('shows yearly pattern', () => {
    describeRecurrence.mockReturnValue({
      pattern: 'yearly',
      averageIntervalMs: 31536000000,
      averageIntervalSeconds: 31536000
    });
    const screen = makeScreen();
    const panel = createRecurrencePanel(screen, {});
    panel.refresh('0 0 1 1 *');
    expect(screen.render).toHaveBeenCalled();
  });

  it('handles custom pattern gracefully', () => {
    describeRecurrence.mockReturnValue({
      pattern: 'custom',
      averageIntervalMs: null,
      averageIntervalSeconds: null
    });
    const screen = makeScreen();
    const panel = createRecurrencePanel(screen, {});
    expect(() => panel.refresh('*/7 */3 * * *')).not.toThrow();
  });
});
