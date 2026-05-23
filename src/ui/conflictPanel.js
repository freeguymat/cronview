const blessed = require('blessed');
const { findConflicts, describeConflict } = require('../cron/conflict');

/**
 * Create a panel that shows scheduling conflicts between multiple expressions
 * @param {blessed.Widgets.Screen} screen
 * @param {blessed.Widgets.BoxElement} parent
 * @returns {{ box: blessed.Widgets.ListElement, refresh: Function }}
 */
function createConflictPanel(screen, parent) {
  const box = blessed.list({
    parent,
    label: ' Conflicts ',
    border: { type: 'line' },
    style: {
      border: { fg: 'red' },
      label: { fg: 'white', bold: true },
      selected: { bg: 'red', fg: 'white' },
      item: { fg: 'yellow' }
    },
    keys: true,
    mouse: true,
    scrollable: true,
    width: '50%',
    height: '40%',
    top: '55%',
    left: '50%'
  });

  function refresh(expressions, windowMinutes = 60) {
    box.clearItems();

    if (!expressions || expressions.length < 2) {
      box.addItem('{grey-fg}Add 2+ expressions to detect conflicts{/}');
      screen.render();
      return;
    }

    const conflicts = findConflicts(expressions, windowMinutes);

    if (conflicts.length === 0) {
      box.addItem('{green-fg}No conflicts found{/}');
    } else {
      box.addItem(`{red-fg}${conflicts.length} conflict(s) detected:{/}`);
      for (const c of conflicts) {
        box.addItem('  ' + describeConflict(c));
      }
    }

    screen.render();
  }

  return { box, refresh };
}

module.exports = { createConflictPanel };
