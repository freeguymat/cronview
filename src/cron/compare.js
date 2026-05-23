import { getNextRuns } from './parser.js';

/**
 * Compare multiple cron expressions side by side.
 * Returns an array of run schedules aligned by index.
 */
export function compareExpressions(expressions, count = 5, fromDate = new Date()) {
  return expressions.map((expr) => ({
    expression: expr,
    runs: getNextRuns(expr, count, fromDate),
  }));
}

/**
 * Find the next time ALL expressions would fire within the same minute.
 */
export function findCommonRun(expressions, limit = 1000, fromDate = new Date()) {
  const results = [];
  let current = new Date(fromDate);

  for (let i = 0; i < limit; i++) {
    current = new Date(current.getTime() + 60_000);
    const runs = expressions.map((expr) => {
      const next = getNextRuns(expr, 1, new Date(current.getTime() - 60_000));
      return next[0];
    });

    const allSameMinute = runs.every((r) => {
      if (!r) return false;
      return (
        r.getFullYear() === current.getFullYear() &&
        r.getMonth() === current.getMonth() &&
        r.getDate() === current.getDate() &&
        r.getHours() === current.getHours() &&
        r.getMinutes() === current.getMinutes()
      );
    });

    if (allSameMinute) {
      results.push(new Date(current));
      if (results.length >= 3) break;
    }
  }

  return results;
}

/**
 * Describe which expression fires more frequently.
 */
export function compareFrequency(exprA, exprB, hours = 24, fromDate = new Date()) {
  const end = new Date(fromDate.getTime() + hours * 3_600_000);
  const runsA = getNextRuns(exprA, 500, fromDate).filter((d) => d <= end);
  const runsB = getNextRuns(exprB, 500, fromDate).filter((d) => d <= end);

  if (runsA.length === runsB.length) return 'equal';
  return runsA.length > runsB.length ? 'first' : 'second';
}
