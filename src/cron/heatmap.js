// heatmap.js — build run-frequency heatmaps for cron expressions

const { getNextRuns } = require('./parser');

/**
 * Build a heatmap of run counts by hour-of-day (0–23) over a given number of days.
 * @param {string} expression
 * @param {number} days
 * @param {Date} [from]
 * @returns {{ hour: number, count: number }[]}
 */
function buildHourlyHeatmap(expression, days = 30, from = new Date()) {
  const totalRuns = days * 24; // generous upper bound
  const runs = getNextRuns(expression, totalRuns, from);
  const cutoff = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  const counts = new Array(24).fill(0);

  for (const run of runs) {
    if (run >= cutoff) break;
    counts[run.getHours()]++;
  }

  return counts.map((count, hour) => ({ hour, count }));
}

/**
 * Build a heatmap of run counts by day-of-week (0=Sun … 6=Sat) over a given number of days.
 * @param {string} expression
 * @param {number} days
 * @param {Date} [from]
 * @returns {{ day: number, label: string, count: number }[]}
 */
function buildDailyHeatmap(expression, days = 30, from = new Date()) {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totalRuns = days * 24;
  const runs = getNextRuns(expression, totalRuns, from);
  const cutoff = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  const counts = new Array(7).fill(0);

  for (const run of runs) {
    if (run >= cutoff) break;
    counts[run.getDay()]++;
  }

  return counts.map((count, day) => ({ day, label: DAY_LABELS[day], count }));
}

/**
 * Render a simple ASCII bar chart from a heatmap array.
 * @param {{ hour?: number, day?: number, label?: string, count: number }[]} heatmap
 * @param {string} [labelKey]
 * @returns {string}
 */
function renderHeatmapChart(heatmap, labelKey = 'hour') {
  if (!heatmap || heatmap.length === 0) return '(no data)';
  const max = Math.max(...heatmap.map(h => h.count), 1);
  const BAR_WIDTH = 20;

  return heatmap.map(entry => {
    const lbl = entry.label !== undefined
      ? entry.label.padStart(3)
      : String(entry[labelKey]).padStart(2);
    const filled = Math.round((entry.count / max) * BAR_WIDTH);
    const bar = '█'.repeat(filled).padEnd(BAR_WIDTH);
    return `${lbl} |${bar}| ${entry.count}`;
  }).join('\n');
}

module.exports = { buildHourlyHeatmap, buildDailyHeatmap, renderHeatmapChart };
