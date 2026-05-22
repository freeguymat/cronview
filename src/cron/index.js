export { getNextRuns, validateExpression, describeExpression } from './parser.js';

import { getNextRuns, validateExpression, describeExpression } from './parser.js';

/**
 * High-level helper: parse and summarize a cron expression
 * Returns a structured object suitable for rendering in the dashboard
 * @param {string} expression
 * @param {object} options
 * @param {number} options.previewCount - how many next runs to include
 * @param {Date}   options.fromDate    - reference date
 * @returns {CronSummary}
 */
export function summarizeCron(expression, { previewCount = 5, fromDate = new Date() } = {}) {
  const { valid, error: validationError } = validateExpression(expression);

  if (!valid) {
    return {
      expression,
      valid: false,
      description: null,
      nextRuns: [],
      error: validationError,
    };
  }

  const description = describeExpression(expression);
  const { nextRuns, error: parseError } = getNextRuns(expression, previewCount, fromDate);

  return {
    expression,
    valid: true,
    description,
    nextRuns,
    error: parseError,
  };
}

/**
 * Format a Date object for terminal display
 * @param {Date} date
 * @returns {string}
 */
export function formatRunDate(date) {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}
