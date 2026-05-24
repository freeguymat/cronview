import { getNextRuns } from './parser.js';

const DEFAULT_THRESHOLD_MINUTES = 5;

/**
 * Check if a cron expression will run within the given threshold (minutes).
 */
export function isRunImminent(expression, thresholdMinutes = DEFAULT_THRESHOLD_MINUTES, now = new Date()) {
  try {
    const runs = getNextRuns(expression, 1, now);
    if (!runs || runs.length === 0) return false;
    const diffMs = runs[0].getTime() - now.getTime();
    return diffMs >= 0 && diffMs <= thresholdMinutes * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Build a notification message for an imminent cron run.
 */
export function buildNotifyMessage(expression, label = null, now = new Date()) {
  try {
    const runs = getNextRuns(expression, 1, now);
    if (!runs || runs.length === 0) return null;
    const next = runs[0];
    const diffMs = next.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const name = label || expression;
    if (diffSec <= 0) {
      return `"${name}" is running now`;
    }
    if (diffSec < 60) {
      return `"${name}" runs in ${diffSec}s`;
    }
    const diffMin = Math.round(diffSec / 60);
    return `"${name}" runs in ${diffMin}m`;
  } catch {
    return null;
  }
}

/**
 * Scan a list of expressions and return those with imminent runs.
 */
export function scanForImminent(expressions, thresholdMinutes = DEFAULT_THRESHOLD_MINUTES, now = new Date()) {
  return expressions
    .filter(({ expression }) => isRunImminent(expression, thresholdMinutes, now))
    .map(({ expression, label }) => ({
      expression,
      label: label || null,
      message: buildNotifyMessage(expression, label, now),
    }));
}
