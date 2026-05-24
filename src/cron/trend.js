const { getNextRuns } = require('./parser');

/**
 * Calculate run frequency trend over multiple time windows.
 * @param {string} expression
 * @param {Date} from
 * @returns {{ hourly: number, daily: number, weekly: number }}
 */
function getRunTrend(expression, from = new Date()) {
  const hour = 3600 * 1000;
  const day = 24 * hour;
  const week = 7 * day;

  const hourlyRuns = getNextRuns(expression, from, 200).filter(
    d => d - from <= hour
  ).length;

  const dailyRuns = getNextRuns(expression, from, 200).filter(
    d => d - from <= day
  ).length;

  const weeklyRuns = getNextRuns(expression, from, 500).filter(
    d => d - from <= week
  ).length;

  return { hourly: hourlyRuns, daily: dailyRuns, weekly: weeklyRuns };
}

/**
 * Classify frequency label based on trend.
 * @param {{ hourly: number, daily: number, weekly: number }} trend
 * @returns {string}
 */
function classifyTrend(trend) {
  if (trend.hourly >= 4) return 'very-high';
  if (trend.hourly >= 1) return 'high';
  if (trend.daily >= 4) return 'medium';
  if (trend.daily >= 1) return 'low';
  return 'rare';
}

/**
 * Describe trend in human-readable form.
 * @param {string} expression
 * @param {Date} from
 * @returns {string}
 */
function describeTrend(expression, from = new Date()) {
  const trend = getRunTrend(expression, from);
  const label = classifyTrend(trend);
  return `Runs ~${trend.daily}x/day, ~${trend.weekly}x/week [${label}]`;
}

module.exports = { getRunTrend, classifyTrend, describeTrend };
