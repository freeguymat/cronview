const { getNextRuns } = require('./parser');

/**
 * Detect if an expression is recurring (runs more than once)
 */
function isRecurring(expression) {
  try {
    const runs = getNextRuns(expression, 2);
    return runs.length >= 2;
  } catch {
    return false;
  }
}

/**
 * Get the recurrence pattern label for an expression
 */
function getRecurrencePattern(expression) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return 'unknown';
  const [minute, hour, dom, month, dow] = parts;

  if (minute === '*' && hour === '*') return 'minutely';
  if (minute !== '*' && hour === '*') return 'hourly';
  if (minute !== '*' && hour !== '*' && dom === '*' && month === '*' && dow === '*') return 'daily';
  if (dow !== '*') return 'weekly';
  if (dom !== '*' && month === '*') return 'monthly';
  if (month !== '*') return 'yearly';
  return 'custom';
}

/**
 * Compute average interval in milliseconds between next N runs
 */
function averageInterval(expression, n = 5) {
  const runs = getNextRuns(expression, n + 1);
  if (runs.length < 2) return null;
  const gaps = [];
  for (let i = 1; i < runs.length; i++) {
    gaps.push(new Date(runs[i]) - new Date(runs[i - 1]));
  }
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
}

/**
 * Describe recurrence in human-readable form
 */
function describeRecurrence(expression) {
  const pattern = getRecurrencePattern(expression);
  const avgMs = averageInterval(expression);
  const avgSec = avgMs ? Math.round(avgMs / 1000) : null;
  return { pattern, averageIntervalMs: avgMs, averageIntervalSeconds: avgSec };
}

module.exports = { isRecurring, getRecurrencePattern, averageInterval, describeRecurrence };
