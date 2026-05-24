// streak.js — track consecutive run streaks for cron expressions

const { getNextRuns } = require('./parser');

/**
 * Given a list of run timestamps, compute the current streak
 * (consecutive runs within expected interval tolerance).
 * @param {Date[]} runs - sorted ascending list of run dates
 * @param {number} intervalMs - expected interval in milliseconds
 * @param {number} toleranceMs - allowed deviation (default 10% of interval)
 * @returns {number} current streak count
 */
function currentStreak(runs, intervalMs, toleranceMs = intervalMs * 0.1) {
  if (!runs || runs.length === 0) return 0;
  let streak = 1;
  for (let i = runs.length - 1; i > 0; i--) {
    const gap = runs[i] - runs[i - 1];
    if (Math.abs(gap - intervalMs) <= toleranceMs) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Compute the longest streak in a run history.
 * @param {Date[]} runs
 * @param {number} intervalMs
 * @param {number} toleranceMs
 * @returns {number}
 */
function longestStreak(runs, intervalMs, toleranceMs = intervalMs * 0.1) {
  if (!runs || runs.length === 0) return 0;
  let best = 1;
  let current = 1;
  for (let i = 1; i < runs.length; i++) {
    const gap = runs[i] - runs[i - 1];
    if (Math.abs(gap - intervalMs) <= toleranceMs) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }
  return best;
}

/**
 * Build a streak summary object for a cron expression.
 * @param {string} expression
 * @param {Date[]} pastRuns - historical run timestamps
 * @param {number} intervalMs
 * @returns {{ current: number, longest: number, label: string }}
 */
function streakSummary(expression, pastRuns, intervalMs) {
  const cur = currentStreak(pastRuns, intervalMs);
  const lng = longestStreak(pastRuns, intervalMs);
  let label = 'No streak';
  if (cur >= 10) label = `🔥 Hot streak: ${cur} runs`;
  else if (cur >= 3) label = `Streak: ${cur} runs`;
  else if (cur === 1) label = 'Active (1 run)';
  return { current: cur, longest: lng, label };
}

module.exports = { currentStreak, longestStreak, streakSummary };
