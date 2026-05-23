import { getNextRuns } from './parser.js';

/**
 * Calculate the interval (in ms) between consecutive runs of a cron expression.
 */
export function getRepeatInterval(expression, fromDate = new Date()) {
  const runs = getNextRuns(expression, fromDate, 2);
  if (!runs || runs.length < 2) return null;
  return runs[1].getTime() - runs[0].getTime();
}

/**
 * Describe the repeat interval in human-readable form.
 */
export function describeInterval(ms) {
  if (ms == null) return 'unknown';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `every ${seconds} second${seconds !== 1 ? 's' : ''}`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `every ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `every ${hours} hour${hours !== 1 ? 's' : ''}`;
  const days = Math.round(hours / 24);
  return `every ${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Check whether two expressions repeat at the same interval.
 */
export function haveSameInterval(exprA, exprB, fromDate = new Date()) {
  const a = getRepeatInterval(exprA, fromDate);
  const b = getRepeatInterval(exprB, fromDate);
  if (a == null || b == null) return false;
  return a === b;
}

/**
 * Return a summary object for a cron expression's repeat characteristics.
 */
export function repeatSummary(expression, fromDate = new Date()) {
  const intervalMs = getRepeatInterval(expression, fromDate);
  return {
    intervalMs,
    description: describeInterval(intervalMs),
  };
}
