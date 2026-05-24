const blessed = require('blessed');
const { describeRecurrence, getRecurrencePattern } = require('../cron/recurrence');

function createRecurrencePanel(screen, parent) {
  const box = blessed.box({
    parent,
    label: ' Recurrence ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    width: '100%',
    height: '100%',
    padding: { left: 1, right: 1 },
    tags: true
  });

  const content = blessed.text({
    parent: box,
    top: 0,
    left: 0,
    width: '100%-2',
    height: '100%-2',
    tags: true,
    content: '{gray-fg}No expression loaded{/gray-fg}'
  });

  function refresh(expression) {
    if (!expression || !expression.trim()) {
      content.setContent('{gray-fg}No expression loaded{/gray-fg}');
      screen.render();
      return;
    }

    try {
      const info = describeRecurrence(expression);
      const patternColors = {
        minutely: 'red', hourly: 'yellow', daily: 'green',
        weekly: 'cyan', monthly: 'blue', yearly: 'magenta', custom: 'white', unknown: 'gray'
      };
      const color = patternColors[info.pattern] || 'white';
      const intervalStr = info.averageIntervalSeconds != null
        ? formatSeconds(info.averageIntervalSeconds)
        : 'N/A';

      const lines = [
        `{bold}Expression:{/bold}  ${expression}`,
        `{bold}Pattern:   {/bold}  {${color}-fg}${info.pattern}{/${color}-fg}`,
        `{bold}Avg Interval:{/bold} ${intervalStr}`
      ];
      content.setContent(lines.join('\n'));
    } catch (err) {
      content.setContent(`{red-fg}Error: ${err.message}{/red-fg}`);
    }

    screen.render();
  }

  function formatSeconds(sec) {
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.round(sec / 60)}m`;
    if (sec < 86400) return `${Math.round(sec / 3600)}h`;
    return `${Math.round(sec / 86400)}d`;
  }

  return { box, refresh };
}

module.exports = { createRecurrencePanel };
