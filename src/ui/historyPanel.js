const blessed = require('blessed');
const { getRecentExpressions, clearHistory } = require('../cron/history');

function createHistoryPanel(screen, parent) {
  const panel = blessed.list({
    parent,
    label: ' Recent Expressions ',
    border: { type: 'line' },
    style: {
      border: { fg: 'cyan' },
      selected: { bg: 'blue', fg: 'white' },
      item: { fg: 'white' }
    },
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    tags: true,
    width: '100%',
    height: '100%'
  });

  function refresh() {
    const expressions = getRecentExpressions(20);
    panel.setItems(
      expressions.length > 0
        ? expressions
        : ['{gray-fg}No history yet{/gray-fg}']
    );
    screen.render();
  }

  function getSelectedExpression() {
    const items = getRecentExpressions(20);
    const idx = panel.selected;
    return items[idx] || null;
  }

  function bindClearKey() {
    panel.key(['d', 'D'], () => {
      clearHistory();
      refresh();
    });
  }

  panel.on('focus', refresh);
  bindClearKey();
  refresh();

  return { panel, refresh, getSelectedExpression };
}

module.exports = { createHistoryPanel };
