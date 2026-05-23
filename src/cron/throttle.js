/**
 * throttle.js — utilities for detecting and describing high-frequency or
 * throttle-worthy cron expressions.
 */

const { getNextRuns } = require('./parser');

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

/**
 * Returns the minimum gap (in ms) between consecutive runs within the next N runs.
 * @param {string} expression
 * @param {number} sampleSize
 * @returns {number}
 */
function minRunGap(expression, sampleSize = 10) {
  const runs = getNextRuns(expression, sampleSize);
  if (runs.length < 2) return Infinity;
  let min = Infinity;
  for (let i = 1; i < runs.length; i++) {
    const gap = new Date(runs[i]) - new Date(runs[i - 1]);
    if (gap < min) min = gap;
  }
  return min;
}

/**
 * Returns true if the expression fires more frequently than the given threshold (ms).
 * @param {string} expression
 * @param {number} thresholdMs — default 1 minute
 * @returns {boolean}
 */
function isThrottled(expression, thresholdMs = MINUTE_MS) {
  return minRunGap(expression) < thresholdMs;
}

/**
 * Returns a human-readable throttle warning or null if expression is fine.
 * @param {string} expression
 * @returns {string|null}
 */
function throttleWarning(expression) {
  const gap = minRunGap(expression);
  if (gap < MINUTE_MS) {
    return `Runs more than once per minute (gap: ${Math.round(gap / 1000)}s) — may overwhelm system.`;
  }
  if (gap < 5 * MINUTE_MS) {
    return `High frequency: runs every ~${Math.round(gap / MINUTE_MS)} minute(s).`;
  }
  return null;
}

/**
 * Summarizes throttle status for an expression.
 * @param {string} expression
 * @returns {{ throttled: boolean, gapMs: number, warning: string|null }}
 */
function throttleSummary(expression) {
  const gapMs = minRunGap(expression);
  const warning = throttleWarning(expression);
  return {
    throttled: gapMs < MINUTE_MS,
    gapMs,
    warning,
  };
}

module.exports = { minRunGap, isThrottled, throttleWarning, throttleSummary };
