// cooldown.js — detect and describe cooldown periods between cron runs

const { getNextRuns } = require('./parser');

/**
 * Returns the minimum gap (in seconds) between any two consecutive runs.
 * @param {string} expression
 * @param {number} sampleSize
 * @returns {number}
 */
function minCooldown(expression, sampleSize = 20) {
  const runs = getNextRuns(expression, sampleSize);
  if (runs.length < 2) return Infinity;
  let min = Infinity;
  for (let i = 1; i < runs.length; i++) {
    const gap = (runs[i] - runs[i - 1]) / 1000;
    if (gap < min) min = gap;
  }
  return min;
}

/**
 * Returns the maximum gap (in seconds) between any two consecutive runs.
 * @param {string} expression
 * @param {number} sampleSize
 * @returns {number}
 */
function maxCooldown(expression, sampleSize = 20) {
  const runs = getNextRuns(expression, sampleSize);
  if (runs.length < 2) return 0;
  let max = 0;
  for (let i = 1; i < runs.length; i++) {
    const gap = (runs[i] - runs[i - 1]) / 1000;
    if (gap > max) max = gap;
  }
  return max;
}

/**
 * Returns true if all gaps between runs are equal (uniform cooldown).
 * @param {string} expression
 * @param {number} sampleSize
 * @returns {boolean}
 */
function isUniformCooldown(expression, sampleSize = 20) {
  const min = minCooldown(expression, sampleSize);
  const max = maxCooldown(expression, sampleSize);
  return isFinite(min) && min === max;
}

/**
 * Returns a human-readable summary of the cooldown for an expression.
 * @param {string} expression
 * @returns {string}
 */
function cooldownSummary(expression) {
  const min = minCooldown(expression);
  const max = maxCooldown(expression);
  if (!isFinite(min)) return 'No cooldown data available';
  const fmt = (s) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.round(s / 60)}m`;
    if (s < 86400) return `${Math.round(s / 3600)}h`;
    return `${Math.round(s / 86400)}d`;
  };
  if (min === max) return `Uniform cooldown: ${fmt(min)}`;
  return `Cooldown range: ${fmt(min)} – ${fmt(max)}`;
}

module.exports = { minCooldown, maxCooldown, isUniformCooldown, cooldownSummary };
