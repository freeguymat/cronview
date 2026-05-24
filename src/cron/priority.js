const { getNextRuns } = require('./parser');

const PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low'];

/**
 * Assign a priority level to a cron expression based on frequency
 * @param {string} expression
 * @returns {'critical'|'high'|'medium'|'low'}
 */
function assignPriority(expression) {
  try {
    const runs = getNextRuns(expression, 10);
    if (runs.length < 2) return 'low';
    const gaps = [];
    for (let i = 1; i < runs.length; i++) {
      gaps.push(runs[i] - runs[i - 1]);
    }
    const avgGapMs = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const avgGapMin = avgGapMs / 60000;
    if (avgGapMin < 5) return 'critical';
    if (avgGapMin < 30) return 'high';
    if (avgGapMin < 360) return 'medium';
    return 'low';
  } catch {
    return 'low';
  }
}

/**
 * Compare two expressions by priority (higher priority first)
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function comparePriority(a, b) {
  const pa = PRIORITY_LEVELS.indexOf(assignPriority(a));
  const pb = PRIORITY_LEVELS.indexOf(assignPriority(b));
  return pa - pb;
}

/**
 * Sort expressions by priority descending
 * @param {string[]} expressions
 * @returns {string[]}
 */
function sortByPriority(expressions) {
  return [...expressions].sort(comparePriority);
}

/**
 * Describe priority level as a human-readable label with badge
 * @param {string} expression
 * @returns {string}
 */
function describePriority(expression) {
  const level = assignPriority(expression);
  const badges = {
    critical: '🔴 Critical',
    high:     '🟠 High',
    medium:   '🟡 Medium',
    low:      '🟢 Low',
  };
  return badges[level] || '🟢 Low';
}

module.exports = { assignPriority, comparePriority, sortByPriority, describePriority, PRIORITY_LEVELS };
