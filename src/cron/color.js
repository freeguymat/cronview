/**
 * Color coding utilities for cron expressions based on frequency/risk
 */

const { getRepeatInterval } = require('./repeat');

const FREQUENCY_COLORS = {
  high: 'red',       // runs more than once per hour
  medium: 'yellow',  // runs hourly to daily
  low: 'green',      // runs less than daily
  unknown: 'white',
};

/**
 * Returns a color label based on how frequently an expression runs.
 * @param {string} expression
 * @returns {string} color name
 */
function colorForExpression(expression) {
  try {
    const interval = getRepeatInterval(expression);
    if (interval === null || interval === undefined) return FREQUENCY_COLORS.unknown;
    if (interval < 60) return FREQUENCY_COLORS.high;
    if (interval < 1440) return FREQUENCY_COLORS.medium;
    return FREQUENCY_COLORS.low;
  } catch {
    return FREQUENCY_COLORS.unknown;
  }
}

/**
 * Returns an ANSI escape-coded string for terminal output.
 * @param {string} text
 * @param {string} color
 * @returns {string}
 */
function applyColor(text, color) {
  const codes = {
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
  };
  const code = codes[color] || codes.white;
  return `${code}${text}${codes.reset}`;
}

/**
 * Returns a colored representation of the expression for display.
 * @param {string} expression
 * @returns {string}
 */
function colorizeExpression(expression) {
  const color = colorForExpression(expression);
  return applyColor(expression, color);
}

/**
 * Returns a badge label string like "[HIGH]", "[MEDIUM]", "[LOW]"
 * @param {string} expression
 * @returns {string}
 */
function frequencyBadge(expression) {
  const color = colorForExpression(expression);
  const label = color === 'red' ? 'HIGH' : color === 'yellow' ? 'MEDIUM' : color === 'green' ? 'LOW' : 'UNKNOWN';
  return applyColor(`[${label}]`, color);
}

module.exports = { colorForExpression, applyColor, colorizeExpression, frequencyBadge };
