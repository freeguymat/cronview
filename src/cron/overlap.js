const { getNextRuns } = require('./parser');

/**
 * Find all time points where two expressions both fire within a given tolerance (seconds).
 */
function findOverlaps(exprA, exprB, count = 20, toleranceSecs = 60) {
  const runsA = getNextRuns(exprA, count * 2);
  const runsB = getNextRuns(exprB, count * 2);
  const overlaps = [];

  for (const a of runsA) {
    for (const b of runsB) {
      const diff = Math.abs(a.getTime() - b.getTime()) / 1000;
      if (diff <= toleranceSecs) {
        overlaps.push({ timeA: a, timeB: b, diffSecs: diff });
        if (overlaps.length >= count) return overlaps;
      }
    }
  }
  return overlaps;
}

/**
 * Return true if the two expressions ever overlap within the next `count` runs.
 */
function expressionsOverlap(exprA, exprB, count = 20, toleranceSecs = 60) {
  return findOverlaps(exprA, exprB, 1, toleranceSecs).length > 0;
}

/**
 * Summarise overlap relationship between two expressions.
 */
function overlapSummary(exprA, exprB, count = 10, toleranceSecs = 60) {
  const overlaps = findOverlaps(exprA, exprB, count, toleranceSecs);
  if (overlaps.length === 0) {
    return {
      hasOverlap: false,
      count: 0,
      message: 'No overlapping runs found in the next preview window.',
    };
  }
  const exact = overlaps.filter(o => o.diffSecs === 0).length;
  return {
    hasOverlap: true,
    count: overlaps.length,
    exactCount: exact,
    nearCount: overlaps.length - exact,
    message: `Found ${overlaps.length} overlapping run(s) (${exact} exact, ${overlaps.length - exact} within ${toleranceSecs}s).`,
    overlaps,
  };
}

module.exports = { findOverlaps, expressionsOverlap, overlapSummary };
