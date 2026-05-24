// digest.js — summarize multiple cron expressions into a periodic digest

const { getNextRuns } = require('./parser');
const { formatInTimezone } = require('./timezone');

/**
 * Build a digest of upcoming runs for a set of expressions within a window.
 * @param {string[]} expressions
 * @param {number} hours - how many hours ahead to look
 * @param {string} [timezone='UTC']
 * @returns {{ expression: string, runs: Date[] }[]}
 */
function buildDigest(expressions, hours = 24, timezone = 'UTC') {
  const now = new Date();
  const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000);

  return expressions
    .filter(expr => typeof expr === 'string' && expr.trim().length > 0)
    .map(expr => {
      let runs = [];
      try {
        runs = getNextRuns(expr, 50).filter(d => d >= now && d <= cutoff);
      } catch (_) {
        runs = [];
      }
      return { expression: expr, runs };
    })
    .filter(entry => entry.runs.length > 0);
}

/**
 * Flatten and sort all upcoming runs across expressions.
 * @param {{ expression: string, runs: Date[] }[]} digest
 * @returns {{ expression: string, run: Date }[]}
 */
function flattenDigest(digest) {
  const flat = [];
  for (const entry of digest) {
    for (const run of entry.runs) {
      flat.push({ expression: entry.expression, run });
    }
  }
  flat.sort((a, b) => a.run - b.run);
  return flat;
}

/**
 * Render a human-readable digest summary string.
 * @param {string[]} expressions
 * @param {number} hours
 * @param {string} timezone
 * @returns {string}
 */
function renderDigestSummary(expressions, hours = 24, timezone = 'UTC') {
  const digest = buildDigest(expressions, hours, timezone);
  if (digest.length === 0) {
    return `No runs scheduled in the next ${hours} hour(s).`;
  }
  const flat = flattenDigest(digest);
  const lines = flat.map(({ expression, run }) => {
    const formatted = formatInTimezone(run, timezone);
    return `  [${expression}] → ${formatted}`;
  });
  return `Digest (next ${hours}h, ${timezone}):\n${lines.join('\n')}`;
}

/**
 * Count total runs per expression within the window.
 * @param {string[]} expressions
 * @param {number} hours
 * @returns {{ expression: string, count: number }[]}
 */
function digestRunCounts(expressions, hours = 24) {
  return buildDigest(expressions, hours).map(({ expression, runs }) => ({
    expression,
    count: runs.length,
  }));
}

module.exports = { buildDigest, flattenDigest, renderDigestSummary, digestRunCounts };
