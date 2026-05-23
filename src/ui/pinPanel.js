const blessed = require('blessed');
const { loadPins, pinExpression, unpinExpression, isPinned, reorderPin } = require('../cron/pin');

function createPinPanel(screen, parent) {
  const panel = blessed.list({
    parent,
    label: ' 📌 Pinned ',
    border: { type: 'line' },
    style: {
      border: { fg: 'yellow' },
      selected: { bg: 'yellow', fg: 'black' },
      item: { fg: 'white' }
    },
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    width: '100%',
    height: '100%'
  });

  function refresh() {
    const pins = loadPins();
    panel.setItems(
      pins.length
        ? pins.map(p => (p.label ? `${p.expression}  (${p.label})` : p.expression))
        : ['No pinned expressions']
    );
    screen.render();
  }

  function getSelectedExpression() {
    const pins = loadPins();
    const idx = panel.selected;
    return pins[idx] ? pins[idx].expression : null;
  }

  function togglePin(expression, label) {
    if (!expression) return;
    if (isPinned(expression)) {
      unpinExpression(expression);
    } else {
      pinExpression(expression, label || '');
    }
    refresh();
  }

  function moveUp() {
    const expr = getSelectedExpression();
    if (!expr) return;
    const pins = loadPins();
    const idx = pins.findIndex(p => p.expression === expr);
    if (idx > 0) reorderPin(expr, idx - 1);
    refresh();
    panel.select(Math.max(0, idx - 1));
  }

  function moveDown() {
    const expr = getSelectedExpression();
    if (!expr) return;
    const pins = loadPins();
    const idx = pins.findIndex(p => p.expression === expr);
    if (idx < pins.length - 1) reorderPin(expr, idx + 1);
    refresh();
    panel.select(Math.min(pins.length - 1, idx + 1));
  }

  panel.key(['d', 'delete'], () => {
    const expr = getSelectedExpression();
    if (expr) { unpinExpression(expr); refresh(); }
  });

  panel.key('K', moveUp);
  panel.key('J', moveDown);

  refresh();

  return { panel, refresh, getSelectedExpression, togglePin, moveUp, moveDown };
}

module.exports = { createPinPanel };
