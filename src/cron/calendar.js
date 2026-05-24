const { getNextRuns } = require('./parser');

/**
 * Build a calendar view of runs for a given month.
 * Returns a map of day-of-month -> array of run times (HH:MM strings).
 */
function buildMonthCalendar(expression, year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const runs = getNextRuns(expression, 500, start);
  const calendar = {};

  for (const run of runs) {
    if (run >= end) break;
    const day = run.getDate();
    if (!calendar[day]) calendar[day] = [];
    const hh = String(run.getHours()).padStart(2, '0');
    const mm = String(run.getMinutes()).padStart(2, '0');
    calendar[day].push(`${hh}:${mm}`);
  }

  return calendar;
}

/**
 * Return a list of days (1-based) in the month that have at least one run.
 */
function getActiveDays(expression, year, month) {
  const cal = buildMonthCalendar(expression, year, month);
  return Object.keys(cal).map(Number).sort((a, b) => a - b);
}

/**
 * Summarize calendar: total runs, active days, busiest day.
 */
function calendarSummary(expression, year, month) {
  const cal = buildMonthCalendar(expression, year, month);
  const days = Object.keys(cal).map(Number);
  if (days.length === 0) {
    return { totalRuns: 0, activeDays: 0, busiestDay: null, busiestCount: 0 };
  }
  let busiestDay = days[0];
  let busiestCount = cal[busiestDay].length;
  let totalRuns = 0;
  for (const day of days) {
    const count = cal[day].length;
    totalRuns += count;
    if (count > busiestCount) {
      busiestCount = count;
      busiestDay = day;
    }
  }
  return { totalRuns, activeDays: days.length, busiestDay, busiestCount };
}

module.exports = { buildMonthCalendar, getActiveDays, calendarSummary };
