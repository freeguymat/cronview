const { getNextRuns } = require('./parser');

/**
 * Compare two cron expressions and return diff of next runs
 */
function diffExpressions(exprA, exprB, count = 5, timezone = 'UTC') {
  const runsA = getNextRuns(exprA, count, timezone);
  const runsB = getNextRuns(exprB, count, timezone);

  const onlyInA = runsA.filter(
    (dateA) => !runsB.some((dateB) => dateB.getTime() === dateA.getTime())
  );
  const onlyInB = runsB.filter(
    (dateB) => !runsA.some((dateA) => dateA.getTime() === dateB.getTime())
  );
  const shared = runsA.filter(
    (dateA) => runsB.some((dateB) => dateB.getTime() === dateA.getTime())
  );

  return { onlyInA, onlyInB, shared };
}

/**
 * Returns a human-readable summary of the diff between two expressions
 */
function describeDiff(exprA, exprB, count = 5, timezone = 'UTC') {
  const { onlyInA, onlyInB, shared } = diffExpressions(exprA, exprB, count, timezone);

  const lines = [];
  lines.push(`Comparing: "${exprA}" vs "${exprB}"`);
  lines.push(`Shared runs (${shared.length}): ${shared.map((d) => d.toISOString()).join(', ') || 'none'}`);
  lines.push(`Only in A (${onlyInA.length}): ${onlyInA.map((d) => d.toISOString()).join(', ') || 'none'}`);
  lines.push(`Only in B (${onlyInB.length}): ${onlyInB.map((d) => d.toISOString()).join(', ') || 'none'}`);

  return lines.join('\n');
}

/**
 * Returns true if two expressions produce identical next runs for `count` iterations
 */
function expressionsAreEquivalent(exprA, exprB, count = 10, timezone = 'UTC') {
  const { onlyInA, onlyInB } = diffExpressions(exprA, exprB, count, timezone);
  return onlyInA.length === 0 && onlyInB.length === 0;
}

module.exports = { diffExpressions, describeDiff, expressionsAreEquivalent };
