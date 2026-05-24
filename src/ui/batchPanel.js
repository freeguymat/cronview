const blessed = require('blessed');
const { batchEvaluate, batchSummary } = require('../cron/batch');
const { formatRunDate } = require('../cron/index');

/**
 * Create a panel that evaluates multiple cron expressions at once.
 * @param {blessed.Widgets.Screen} screen
 * @param {blessed.Widgets.BoxElement} parent
 */
function createBatchPanel(screen, parent) {
  const box = blessed.box({
    parent,
    label: ' Batch Evaluate ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    padding: { left: 1, right: 1 },
  });

  let _expressions = [];

  function refresh(expressions) {
    _expressions = Array.isArray(expressions) ? expressions : [];
    if (_expressions.length === 0) {
      box.setContent('{gray-fg}No expressions to evaluate.{/gray-fg}');
      screen.render();
      return;
    }

    const results = batchEvaluate(_expressions, 3);
    const summary = batchSummary(results);
    const lines = [];

    lines.push(
      `{bold}Total:{/bold} ${summary.total}  {green-fg}Valid: ${summary.valid}{/green-fg}  {red-fg}Invalid: ${summary.invalid}{/red-fg}`,
      ''
    );

    for (const r of results) {
      if (!r.valid) {
        lines.push(`{red-fg}✗ ${r.expression}{/red-fg}  — ${r.error || 'invalid'}`);
      } else {
        const runStr = r.runs.map((d) => formatRunDate(d)).join('  |  ');
        lines.push(`{green-fg}✓{/green-fg} {bold}${r.expression}{/bold}`);
        lines.push(`  Next: ${runStr}`);
      }
      lines.push('');
    }

    box.setContent(lines.join('\n'));
    screen.render();
  }

  function getExpressions() {
    return _expressions.slice();
  }

  return { box, refresh, getExpressions };
}

module.exports = { createBatchPanel };
