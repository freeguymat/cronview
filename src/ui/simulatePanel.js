const blessed = require('blessed');
const { simulateRange, summarizeRange } = require('../cron/simulate');
const { formatInTimezone } = require('../cron/timezone');

/**
 * Create a simulation panel that shows cron runs over a date range
 */
function createSimulatePanel(screen, options = {}) {
  const box = blessed.box({
    label: ' Simulate Range ',
    border: { type: 'line' },
    top: options.top || 0,
    left: options.left || 0,
    width: options.width || '50%',
    height: options.height || '50%',
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    style: {
      border: { fg: 'cyan' },
      label: { fg: 'cyan', bold: true }
    },
    tags: true
  });

  let currentExpression = null;
  let currentTimezone = 'UTC';

  function refresh(expression, fromDate, toDate, timezone = 'UTC') {
    currentExpression = expression;
    currentTimezone = timezone;

    if (!expression) {
      box.setContent('{gray-fg}No expression selected.{/gray-fg}');
      screen.render();
      return;
    }

    let runs;
    let summary;
    try {
      runs = simulateRange(expression, fromDate, toDate, timezone);
      summary = summarizeRange(expression, fromDate, toDate);
    } catch (err) {
      box.setContent(`{red-fg}Error: ${err.message}{/red-fg}`);
      screen.render();
      return;
    }

    const lines = [];
    lines.push(`{bold}Expression:{/bold} {green-fg}${expression}{/green-fg}`);
    lines.push(`{bold}Timezone:{/bold}  ${timezone}`);
    lines.push(`{bold}Total runs:{/bold} ${summary.total}  {bold}Per day:{/bold} ${summary.perDay}  {bold}Per hour:{/bold} ${summary.perHour}`);
    lines.push('{gray-fg}' + '─'.repeat(40) + '{/gray-fg}');

    if (runs.length === 0) {
      lines.push('{yellow-fg}No runs scheduled in this range.{/yellow-fg}');
    } else {
      runs.forEach((date, i) => {
        const formatted = formatInTimezone(date, timezone);
        lines.push(`{cyan-fg}${String(i + 1).padStart(3)}.{/cyan-fg} ${formatted}`);
      });
      if (summary.total === 500) {
        lines.push('{yellow-fg}(results capped at 500){/yellow-fg}');
      }
    }

    box.setContent(lines.join('\n'));
    screen.render();
  }

  return { box, refresh };
}

module.exports = { createSimulatePanel };
