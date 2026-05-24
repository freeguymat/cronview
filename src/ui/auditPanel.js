// auditPanel.js — blessed panel for displaying audit log in cronview
const blessed = require('blessed');
const { getRecentEvents, clearAuditLog, auditSummary } = require('../cron/audit');

function createAuditPanel(screen, parent) {
  const box = blessed.box({
    parent,
    label: ' Audit Log ',
    border: { type: 'line' },
    style: {
      border: { fg: 'cyan' },
      label: { fg: 'white', bold: true }
    },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    width: '100%',
    height: '100%'
  });

  const summaryLine = blessed.text({
    parent: box,
    top: 0,
    left: 1,
    style: { fg: 'yellow' }
  });

  const list = blessed.list({
    parent: box,
    top: 2,
    left: 0,
    width: '100%-2',
    height: '100%-4',
    keys: true,
    vi: true,
    mouse: true,
    style: {
      selected: { bg: 'blue', fg: 'white' },
      item: { fg: 'green' }
    }
  });

  function refresh() {
    const events = getRecentEvents(50);
    const summary = auditSummary();
    summaryLine.setContent(
      `Total: ${summary.total}  |  Actions: ${Object.entries(summary.byAction)
        .map(([k, v]) => `${k}(${v})`)
        .join(', ')}`
    );
    const items = events.map(e => {
      const ts = e.timestamp ? e.timestamp.replace('T', ' ').slice(0, 19) : '?';
      return `${ts}  [${e.action}]  ${e.expression}`;
    });
    list.setItems(items.length ? items : ['No audit events recorded.']);
    screen.render();
  }

  function bindClearKey(key = 'C-d') {
    box.key(key, () => {
      clearAuditLog();
      refresh();
    });
  }

  function getSelectedEvent() {
    const idx = list.selected;
    return getRecentEvents(50)[idx] || null;
  }

  refresh();

  return { box, refresh, bindClearKey, getSelectedEvent };
}

module.exports = { createAuditPanel };
