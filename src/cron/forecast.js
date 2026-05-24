/**
 * forecast.js — Generate run forecasts for cron expressions over a time window.
 * Provides bucketed frequency counts and peak-hour analysis.
 */

const { getNextRuns } = require('./parser');

/**
 * Generate a forecast of run counts bucketed by hour over the next N days.
 * @param {string} expression - Cron expression
 * @param {number} days - Number of days to forecast (default 7)
 * @param {Date} from - Start date (default now)
 * @returns {{ buckets: number[], peakHour: number, totalRuns: number, dailyAverage: number }}
 */
function forecastRuns(expression, days = 7, from = new Date()) {
  const to = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  const maxRuns = days * 24 * 60; // upper bound: once per minute

  let runs;
  try {
    runs = getNextRuns(expression, maxRuns, from);
  } catch {
    return null;
  }

  // Filter runs within the window
  const inWindow = runs.filter(d => d >= from && d < to);

  // 24 buckets — one per hour of day
  const buckets = new Array(24).fill(0);
  for (const run of inWindow) {
    buckets[run.getHours()]++;
  }

  const peakHour = buckets.indexOf(Math.max(...buckets));
  const totalRuns = inWindow.length;
  const dailyAverage = totalRuns / days;

  return { buckets, peakHour, totalRuns, dailyAverage };
}

/**
 * Return a text-based bar chart of hourly run distribution.
 * @param {number[]} buckets - Array of 24 counts
 * @param {number} width - Max bar width in chars (default 20)
 * @returns {string}
 */
function renderForecastChart(buckets, width = 20) {
  const max = Math.max(...buckets, 1);
  const lines = buckets.map((count, hour) => {
    const bar = '█'.repeat(Math.round((count / max) * width));
    const label = String(hour).padStart(2, '0') + ':00';
    return `${label} ${bar.padEnd(width)} ${count}`;
  });
  return lines.join('\n');
}

/**
 * Describe the forecast in plain English.
 * @param {{ totalRuns: number, dailyAverage: number, peakHour: number }} forecast
 * @param {number} days
 * @returns {string}
 */
function describeForecast(forecast, days = 7) {
  if (!forecast) return 'Invalid expression — cannot forecast.';
  const { totalRuns, dailyAverage, peakHour } = forecast;
  const avg = dailyAverage.toFixed(1);
  const peak = `${String(peakHour).padStart(2, '0')}:00`;
  return `Over ${days} day${days !== 1 ? 's' : ''}: ${totalRuns} total run${totalRuns !== 1 ? 's' : ''}, ~${avg}/day, peak activity at ${peak}.`;
}

/**
 * Find the busiest day (0=Sun … 6=Sat) within the forecast window.
 * @param {string} expression
 * @param {number} days
 * @param {Date} from
 * @returns {{ dayIndex: number, dayName: string, count: number }}
 */
function busiestDay(expression, days = 7, from = new Date()) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const to = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  const maxRuns = days * 24 * 60;

  let runs;
  try {
    runs = getNextRuns(expression, maxRuns, from);
  } catch {
    return null;
  }

  const inWindow = runs.filter(d => d >= from && d < to);
  const dayCounts = new Array(7).fill(0);
  for (const run of inWindow) {
    dayCounts[run.getDay()]++;
  }

  const dayIndex = dayCounts.indexOf(Math.max(...dayCounts));
  return { dayIndex, dayName: dayNames[dayIndex], count: dayCounts[dayIndex] };
}

module.exports = { forecastRuns, renderForecastChart, describeForecast, busiestDay };
