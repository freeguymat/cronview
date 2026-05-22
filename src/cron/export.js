const fs = require('fs');
const path = require('path');
const { getNextRuns, describeExpression } = require('./parser');
const { formatRunDate } = require('./index');

/**
 * Export cron expressions and their next runs to a JSON file
 */
function exportToJSON(expressions, timezone, outputPath, count = 5) {
  const data = expressions.map((expr) => {
    let runs = [];
    let error = null;
    try {
      runs = getNextRuns(expr, count, timezone).map((d) => formatRunDate(d, timezone));
    } catch (e) {
      error = e.message;
    }
    return {
      expression: expr,
      description: (() => { try { return describeExpression(expr); } catch { return 'Invalid'; } })(),
      timezone: timezone || 'UTC',
      nextRuns: runs,
      error,
    };
  });

  const json = JSON.stringify({ exportedAt: new Date().toISOString(), entries: data }, null, 2);
  fs.writeFileSync(outputPath, json, 'utf8');
  return data;
}

/**
 * Export cron expressions and their next runs to a CSV file
 */
function exportToCSV(expressions, timezone, outputPath, count = 5) {
  const rows = ['expression,description,timezone,run_index,run_time,error'];

  for (const expr of expressions) {
    let runs = [];
    let error = '';
    let description = '';
    try {
      description = describeExpression(expr);
      runs = getNextRuns(expr, count, timezone).map((d) => formatRunDate(d, timezone));
    } catch (e) {
      error = e.message;
    }

    if (runs.length === 0) {
      rows.push(`"${expr}","${description}","${timezone || 'UTC'}",0,,"${error}"`);
    } else {
      runs.forEach((run, i) => {
        rows.push(`"${expr}","${description}","${timezone || 'UTC'}",${i + 1},"${run}","${error}"`);
      });
    }
  }

  const csv = rows.join('\n');
  fs.writeFileSync(outputPath, csv, 'utf8');
  return csv;
}

/**
 * Resolve output path, defaulting to cwd if only a filename is given
 */
function resolveOutputPath(filename) {
  if (path.isAbsolute(filename)) return filename;
  return path.join(process.cwd(), filename);
}

module.exports = { exportToJSON, exportToCSV, resolveOutputPath };
