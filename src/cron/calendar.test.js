const { buildMonthCalendar, getActiveDays, calendarSummary } = require('./calendar');

// Mock parser
jest.mock('./parser', () => ({
  getNextRuns: jest.fn(),
}));
const { getNextRuns } = require('./parser');

function makeRuns(dates) {
  return dates.map(d => new Date(d));
}

describe('buildMonthCalendar', () => {
  it('groups runs by day within the month', () => {
    getNextRuns.mockReturnValue(makeRuns([
      '2024-03-05T08:00:00',
      '2024-03-05T20:00:00',
      '2024-03-12T08:00:00',
      '2024-04-01T08:00:00', // outside month
    ]));
    const cal = buildMonthCalendar('0 8 * * *', 2024, 3);
    expect(Object.keys(cal).map(Number).sort((a,b)=>a-b)).toEqual([5, 12]);
    expect(cal[5]).toHaveLength(2);
    expect(cal[12]).toHaveLength(1);
  });

  it('returns empty object when no runs', () => {
    getNextRuns.mockReturnValue([]);
    const cal = buildMonthCalendar('0 0 31 2 *', 2024, 2);
    expect(cal).toEqual({});
  });
});

describe('getActiveDays', () => {
  it('returns sorted active days', () => {
    getNextRuns.mockReturnValue(makeRuns([
      '2024-06-10T08:00:00',
      '2024-06-03T08:00:00',
      '2024-06-10T20:00:00',
    ]));
    const days = getActiveDays('* * * * *', 2024, 6);
    expect(days).toEqual([3, 10]);
  });
});

describe('calendarSummary', () => {
  it('computes summary correctly', () => {
    getNextRuns.mockReturnValue(makeRuns([
      '2024-01-01T06:00:00',
      '2024-01-01T12:00:00',
      '2024-01-01T18:00:00',
      '2024-01-15T08:00:00',
    ]));
    const s = calendarSummary('0 */6 * * *', 2024, 1);
    expect(s.totalRuns).toBe(4);
    expect(s.activeDays).toBe(2);
    expect(s.busiestDay).toBe(1);
    expect(s.busiestCount).toBe(3);
  });

  it('handles no runs', () => {
    getNextRuns.mockReturnValue([]);
    const s = calendarSummary('0 0 31 2 *', 2024, 2);
    expect(s.totalRuns).toBe(0);
    expect(s.busiestDay).toBeNull();
  });
});
