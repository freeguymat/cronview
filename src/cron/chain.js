/**
 * chain.js — utilities for chaining/sequencing cron expressions
 * e.g. find the order in which a set of jobs will fire next
 */

const { getNextRuns } = require('./parser');

/**
 * Given an array of { label, expression } objects, return them sorted
 * by their next scheduled run time (ascending).
 * @param {Array<{label: string, expression: string}>} jobs
 * @param {Date} [from]
 * @returns {Array<{label: string, expression: string, nextRun: Date}>}
 */
function chainJobs(jobs, from = new Date()) {
  return jobs
    .map(({ label, expression }) => {
      const runs = getNextRuns(expression, 1, from);
      return { label, expression, nextRun: runs[0] || null };
    })
    .filter((j) => j.nextRun !== null)
    .sort((a, b) => a.nextRun - b.nextRun);
}

/**
 * Return the gap in milliseconds between consecutive jobs in a chain.
 * @param {Array<{label: string, expression: string, nextRun: Date}>} chain
 * @returns {Array<{from: string, to: string, gapMs: number}>}
 */
function chainGaps(chain) {
  const gaps = [];
  for (let i = 0; i < chain.length - 1; i++) {
    gaps.push({
      from: chain[i].label,
      to: chain[i + 1].label,
      gapMs: chain[i + 1].nextRun - chain[i].nextRun,
    });
  }
  return gaps;
}

/**
 * Describe a chain in human-readable form.
 * @param {Array<{label: string, expression: string, nextRun: Date}>} chain
 * @returns {string}
 */
function describeChain(chain) {
  if (!chain.length) return 'No jobs in chain.';
  return chain
    .map((j, i) => `${i + 1}. [${j.label}] → ${j.nextRun.toISOString()}`)
    .join('\n');
}

module.exports = { chainJobs, chainGaps, describeChain };
