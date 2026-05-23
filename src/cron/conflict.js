const { getNextRuns } = require('./parser');

/**
 * Find expressions that run at the same time within a window
 * @param {string[]} expressions
 * @param {number} windowMinutes
 * @returns {Array<{time: Date, expressions: string[]}>}
 */
function findConflicts(expressions, windowMinutes = 60) {
  const now = new Date();
  const end = new Date(now.getTime() + windowMinutes * 60 * 1000);
  const runMap = new Map();

  for (const expr of expressions) {
    try {
      const runs = getNextRuns(expr, 20);
      for (const run of runs) {
        if (run > end) break;
        const key = Math.floor(run.getTime() / 60000);
        if (!runMap.has(key)) runMap.set(key, { time: run, expressions: [] });
        runMap.get(key).expressions.push(expr);
      }
    } catch (_) {
      // skip invalid
    }
  }

  return [...runMap.values()].filter(e => e.expressions.length > 1);
}

/**
 * Check if two expressions ever conflict within N runs
 * @param {string} exprA
 * @param {string} exprB
 * @param {number} limit
 * @returns {boolean}
 */
function expressionsConflict(exprA, exprB, limit = 50) {
  try {
    const runsA = getNextRuns(exprA, limit).map(d => Math.floor(d.getTime() / 60000));
    const setA = new Set(runsA);
    const runsB = getNextRuns(exprB, limit).map(d => Math.floor(d.getTime() / 60000));
    return runsB.some(t => setA.has(t));
  } catch (_) {
    return false;
  }
}

/**
 * Describe a conflict result as a human-readable string
 * @param {{time: Date, expressions: string[]}} conflict
 * @returns {string}
 */
function describeConflict(conflict) {
  const timeStr = conflict.time.toLocaleString();
  const list = conflict.expressions.join(', ');
  return `At ${timeStr}: [${list}]`;
}

module.exports = { findConflicts, expressionsConflict, describeConflict };
