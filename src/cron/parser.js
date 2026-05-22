import { parseExpression } from 'cron-parser';

/**
 * Parse a cron expression and return the next N run dates
 * @param {string} expression - cron expression
 * @param {number} count - number of next runs to return
 * @param {Date} fromDate - start date for calculation
 * @returns {{ nextRuns: Date[], error: string|null }}
 */
export function getNextRuns(expression, count = 5, fromDate = new Date()) {
  try {
    const interval = parseExpression(expression, {
      currentDate: fromDate,
      iterator: true,
    });

    const nextRuns = [];
    for (let i = 0; i < count; i++) {
      const { value, done } = interval.next();
      if (done) break;
      nextRuns.push(value.toDate());
    }

    return { nextRuns, error: null };
  } catch (err) {
    return { nextRuns: [], error: err.message };
  }
}

/**
 * Validate a cron expression
 * @param {string} expression
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateExpression(expression) {
  try {
    parseExpression(expression);
    return { valid: true, error: null };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Describe a cron expression in human-readable form (basic)
 * @param {string} expression
 * @returns {string}
 */
export function describeExpression(expression) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5) return 'Invalid expression';

  const [minute, hour, dom, month, dow] = parts;

  if (expression === '* * * * *') return 'Every minute';
  if (minute !== '*' && hour !== '*' && dom === '*' && month === '*' && dow === '*') {
    return `Daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  if (minute.startsWith('*/')) {
    return `Every ${minute.slice(2)} minutes`;
  }
  if (hour.startsWith('*/')) {
    return `Every ${hour.slice(2)} hours`;
  }

  return `Custom schedule (${expression})`;
}
