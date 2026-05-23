const { getTagsForExpression } = require('./tags');

/**
 * Group an array of expressions by a given key function.
 * @param {string[]} expressions
 * @param {function} keyFn - returns a string key for each expression
 * @returns {Object} map of key -> expressions[]
 */
function groupBy(expressions, keyFn) {
  return expressions.reduce((acc, expr) => {
    const key = keyFn(expr);
    if (!acc[key]) acc[key] = [];
    acc[key].push(expr);
    return acc;
  }, {});
}

/**
 * Group expressions by their first tag (or 'untagged').
 * @param {string[]} expressions
 * @returns {Object}
 */
function groupByTag(expressions) {
  return groupBy(expressions, (expr) => {
    const tags = getTagsForExpression(expr);
    return (tags && tags.length > 0) ? tags[0] : 'untagged';
  });
}

/**
 * Group expressions by their minute field (first field).
 * @param {string[]} expressions
 * @returns {Object}
 */
function groupByFrequency(expressions) {
  return groupBy(expressions, (expr) => {
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5) return 'invalid';
    const minute = parts[0];
    if (minute === '*') return 'every-minute';
    if (minute === '*/5') return 'every-5-min';
    if (minute === '*/15') return 'every-15-min';
    if (minute === '*/30') return 'every-30-min';
    if (/^\d+$/.test(minute)) return 'hourly-or-less';
    return 'other';
  });
}

/**
 * List all group keys for a grouped result.
 * @param {Object} grouped
 * @returns {string[]}
 */
function listGroups(grouped) {
  return Object.keys(grouped).sort();
}

/**
 * Flatten grouped expressions back into a sorted array.
 * @param {Object} grouped
 * @returns {string[]}
 */
function flattenGroups(grouped) {
  return Object.values(grouped).flat();
}

module.exports = { groupBy, groupByTag, groupByFrequency, listGroups, flattenGroups };
