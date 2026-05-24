const { getNextRuns, validateExpression } = require('./parser');

/**
 * Evaluate multiple cron expressions at once and return their next runs.
 * @param {string[]} expressions
 * @param {number} count - number of next runs per expression
 * @param {Date} [from]
 * @returns {Array<{expression: string, valid: boolean, runs: Date[], error?: string}>}
 */
function batchEvaluate(expressions, count = 5, from = new Date()) {
  return expressions.map((expression) => {
    const validation = validateExpression(expression);
    if (!validation.valid) {
      return { expression, valid: false, runs: [], error: validation.error };
    }
    try {
      const runs = getNextRuns(expression, count, from);
      return { expression, valid: true, runs };
    } catch (err) {
      return { expression, valid: false, runs: [], error: err.message };
    }
  });
}

/**
 * Find expressions that share a next-run time within a given tolerance (ms).
 * @param {string[]} expressions
 * @param {number} toleranceMs
 * @param {Date} [from]
 * @returns {Array<{time: Date, expressions: string[]}>}
 */
function findCoincidentRuns(expressions, toleranceMs = 60000, from = new Date()) {
  const results = batchEvaluate(expressions, 10, from);
  const valid = results.filter((r) => r.valid);
  const coincident = [];

  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      for (const t1 of valid[i].runs) {
        for (const t2 of valid[j].runs) {
          if (Math.abs(t1 - t2) <= toleranceMs) {
            const existing = coincident.find((c) => Math.abs(c.time - t1) <= toleranceMs);
            if (existing) {
              if (!existing.expressions.includes(valid[i].expression)) existing.expressions.push(valid[i].expression);
              if (!existing.expressions.includes(valid[j].expression)) existing.expressions.push(valid[j].expression);
            } else {
              coincident.push({ time: t1, expressions: [valid[i].expression, valid[j].expression] });
            }
          }
        }
      }
    }
  }

  return coincident.sort((a, b) => a.time - b.time);
}

/**
 * Summarize a batch evaluation into a simple stats object.
 * @param {ReturnType<typeof batchEvaluate>} batchResult
 */
function batchSummary(batchResult) {
  const total = batchResult.length;
  const valid = batchResult.filter((r) => r.valid).length;
  const invalid = total - valid;
  return { total, valid, invalid };
}

module.exports = { batchEvaluate, findCoincidentRuns, batchSummary };
