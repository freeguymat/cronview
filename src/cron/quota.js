// quota.js — track and enforce max runs per time window for a cron expression

const { getNextRuns } = require('./parser');

/**
 * Count how many times an expression fires within a given number of hours.
 * @param {string} expression
 * @param {number} hours
 * @returns {number}
 */
function countRunsInHours(expression, hours) {
  const now = new Date();
  const end = new Date(now.getTime() + hours * 60 * 60 * 1000);
  const runs = getNextRuns(expression, 500);
  return runs.filter(r => new Date(r) <= end).length;
}

/**
 * Check whether an expression exceeds a max-runs quota within a window.
 * @param {string} expression
 * @param {number} maxRuns
 * @param {number} windowHours
 * @returns {{ exceeded: boolean, count: number, maxRuns: number, windowHours: number }}
 */
function checkQuota(expression, maxRuns, windowHours = 24) {
  const count = countRunsInHours(expression, windowHours);
  return {
    exceeded: count > maxRuns,
    count,
    maxRuns,
    windowHours,
  };
}

/**
 * Build a human-readable quota summary.
 * @param {string} expression
 * @param {number} maxRuns
 * @param {number} windowHours
 * @returns {string}
 */
function quotaSummary(expression, maxRuns, windowHours = 24) {
  const { exceeded, count } = checkQuota(expression, maxRuns, windowHours);
  const status = exceeded ? '⚠ EXCEEDED' : '✓ OK';
  return `[${status}] ${count}/${maxRuns} runs in ${windowHours}h window`;
}

/**
 * Return a suggested safe max based on observed frequency.
 * @param {string} expression
 * @param {number} windowHours
 * @returns {number}
 */
function suggestQuota(expression, windowHours = 24) {
  const count = countRunsInHours(expression, windowHours);
  // suggest 20% headroom above observed count, minimum 1
  return Math.max(1, Math.ceil(count * 1.2));
}

module.exports = { countRunsInHours, checkQuota, quotaSummary, suggestQuota };
