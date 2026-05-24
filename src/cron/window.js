import { getNextRuns } from './parser.js';

/**
 * Returns all runs within a time window [start, end]
 */
export function getRunsInWindow(expression, start, end) {
  if (!(start instanceof Date) || !(end instanceof Date)) {
    throw new Error('start and end must be Date objects');
  }
  if (start >= end) return [];

  const maxRuns = 10000;
  const runs = getNextRuns(expression, maxRuns, start);
  return runs.filter(d => d >= start && d <= end);
}

/**
 * Describes a time window in human-readable form
 */
export function describeWindow(start, end) {
  const ms = end - start;
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  const hours = Math.round(ms / 3600000);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  const days = Math.round(ms / 86400000);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Returns a summary of runs in the window
 */
export function windowSummary(expression, start, end) {
  const runs = getRunsInWindow(expression, start, end);
  const span = describeWindow(start, end);
  if (runs.length === 0) {
    return { count: 0, span, first: null, last: null };
  }
  return {
    count: runs.length,
    span,
    first: runs[0],
    last: runs[runs.length - 1],
  };
}

/**
 * Checks if any run falls within the window
 */
export function hasRunInWindow(expression, start, end) {
  const runs = getRunsInWindow(expression, start, end);
  return runs.length > 0;
}
