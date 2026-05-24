const blessed = require('blessed');
const { createCalendarPanel } = require('./calendarPanel');

jest.mock('../cron/calendar', () => ({
  buildMonthCalendar: jest.fn(),
  calendarSummary: jest.fn(),
}));
const { buildMonthCalendar, calendarSummary } = require('../cron/calendar');

function makeScreen() {
  return blessed.screen({ smartCSR: true, terminal: 'xterm', output: require('fs').createWriteStream('/dev/null') });
}

function makeParent(screen) {
  return blessed.box({ parent: screen, width: '100%', height: '100%' });
}

describe('createCalendarPanel', () => {
  let screen, parent, panel;

  beforeEach(() => {
    screen = makeScreen();
    parent = makeParent(screen);
    buildMonthCalendar.mockReturnValue({ 5: ['08:00'], 12: ['08:00', '20:00'] });
    calendarSummary.mockReturnValue({ totalRuns: 3, activeDays: 2, busiestDay: 12, busiestCount: 2 });
    panel = createCalendarPanel(screen, parent);
  });

  afterEach(() => {
    screen.destroy();
    jest.clearAllMocks();
  });

  it('creates a box element', () => {
    expect(panel.box).toBeDefined();
  });

  it('refresh renders calendar content', () => {
    panel.refresh('0 8 * * *');
    const content = panel.box.getContent();
    expect(content).toContain('Total runs');
    expect(content).toContain('3');
  });

  it('shows placeholder when no expression', () => {
    panel.refresh(null);
    expect(panel.box.getContent()).toContain('No expression');
  });

  it('prevMonth decrements month and re-renders', () => {
    panel.refresh('0 8 * * *');
    panel.prevMonth();
    expect(buildMonthCalendar).toHaveBeenCalledTimes(2);
  });

  it('nextMonth increments month and re-renders', () => {
    panel.refresh('0 8 * * *');
    panel.nextMonth();
    expect(buildMonthCalendar).toHaveBeenCalledTimes(2);
  });

  it('month wraps from Jan to Dec on prevMonth', () => {
    // Force viewMonth to 1
    const calls = [];
    buildMonthCalendar.mockImplementation((expr, y, m) => { calls.push({ y, m }); return {}; });
    calendarSummary.mockReturnValue({ totalRuns: 0, activeDays: 0, busiestDay: null, busiestCount: 0 });
    panel.refresh('* * * * *'); // current month
    const initialYear = calls[0].y;
    // Navigate back to January
    for (let i = 0; i < calls[0].m - 1; i++) panel.prevMonth();
    panel.prevMonth(); // should wrap to December of previous year
    const last = calls[calls.length - 1];
    expect(last.m).toBe(12);
    expect(last.y).toBe(initialYear - 1);
  });
});
