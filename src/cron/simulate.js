const { getNextRuns } = require('./parser');
const { convertToTimezone } = require('./timezone');

/**
 * Simulate cron runs between two dates
 * @param {string} expression - cron expression
 * @param {Date} from - start date
 * @param {Date} to - end date
 * @param {string} [timezone] - optional timezone
 * @returns {Date[]} list of scheduled run times
 */
function simulateRange(expression, from, to, timezone = null) {
  if (!(from instanceof Date) || !(to instanceof Date)) {
    throw new Error('from and to must be Date objects');
  }
  if (from >= to) {
    throw new Error('from must be before to');
  }

  const maxRuns = 500;
  const results = [];
  let current = new Date(from);

  while (current < to && results.length < maxRuns) {
    const [next] = getNextRuns(expression, 1, current);
    if (!next || next >= to) break;
    const date = timezone ? convertToTimezone(next, timezone) : next;
    results.push(date);
    current = new Date(next.getTime() + 1000);
  }

  return results;
}

/**
 * Count how many times a cron fires in a given window
 * @param {string} expression
 * @param {Date} from
 * @param {Date} to
 * @param {string} [timezone]
 * @returns {number}
 */
function countRunsInRange(expression, from, to, timezone = null) {
  return simulateRange(expression, from, to, timezone).length;
}

/**
 * Get a summary of run frequency per hour/day for a range
 * @param {string} expression
 * @param {Date} from
 * @param {Date} to
 * @returns {{ total: number, perDay: number, perHour: number }}
 */
function summarizeRange(expression, from, to) {
  const runs = simulateRange(expression, from, to);
  const ms = to - from;
  const hours = ms / (1000 * 60 * 60);
  const days = hours / 24;
  return {
    total: runs.length,
    perDay: days > 0 ? parseFloat((runs.length / days).toFixed(2)) : 0,
    perHour: hours > 0 ? parseFloat((runs.length / hours).toFixed(2)) : 0
  };
}

module.exports = { simulateRange, countRunsInRange, summarizeRange };
