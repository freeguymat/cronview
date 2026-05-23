const { getNextRuns } = require('./parser');
const { convertToTimezone } = require('./timezone');

/**
 * Build a human-readable schedule summary for a cron expression.
 * @param {string} expression
 * @param {object} options
 * @param {number} options.count - number of upcoming runs to include
 * @param {string} options.timezone - IANA timezone string
 * @returns {object}
 */
function buildSchedule(expression, options = {}) {
  const { count = 5, timezone = 'UTC' } = options;
  const runs = getNextRuns(expression, count);
  const converted = runs.map(date => convertToTimezone(date, timezone));
  return {
    expression,
    timezone,
    runs: converted,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Check if two expressions share any run times within a given window.
 * @param {string} exprA
 * @param {string} exprB
 * @param {number} count - how many runs to compare per expression
 * @returns {Date[]}
 */
function findOverlappingRuns(exprA, exprB, count = 20) {
  const runsA = getNextRuns(exprA, count).map(d => d.getTime());
  const setA = new Set(runsA);
  const runsB = getNextRuns(exprB, count);
  return runsB.filter(d => setA.has(d.getTime()));
}

/**
 * Returns the gap in milliseconds between the next two runs of an expression.
 * @param {string} expression
 * @returns {number|null}
 */
function nextRunGap(expression) {
  const runs = getNextRuns(expression, 2);
  if (runs.length < 2) return null;
  return runs[1].getTime() - runs[0].getTime();
}

/**
 * Determine if a cron expression runs more frequently than a given threshold (ms).
 * @param {string} expression
 * @param {number} thresholdMs
 * @returns {boolean}
 */
function isHighFrequency(expression, thresholdMs = 60 * 60 * 1000) {
  const gap = nextRunGap(expression);
  if (gap === null) return false;
  return gap < thresholdMs;
}

module.exports = { buildSchedule, findOverlappingRuns, nextRunGap, isHighFrequency };
