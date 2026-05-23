const blessed = require('blessed');
const { setLabel, getLabel, removeLabel, listLabels } = require('../cron/label');

function createLabelPanel(screen, parent) {
  const panel = blessed.box({
    parent,
    label: ' Labels ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'white' } },
    width: '100%',
    height: '100%',
    scrollable: true,
    keys: true,
    mouse: true,
  });

  const list = blessed.list({
    parent: panel,
    top: 0,
    left: 0,
    width: '100%-2',
    height: '100%-2',
    keys: true,
    mouse: true,
    style: {
      selected: { bg: 'blue', fg: 'white' },
      item: { fg: 'white' },
    },
  });

  let currentExpression = null;

  function refresh(expression) {
    currentExpression = expression || currentExpression;
    const all = listLabels();
    const items = Object.entries(all).map(
      ([expr, lbl]) => `{bold}${lbl}{/bold}  {gray-fg}${expr}{/gray-fg}`
    );
    list.setItems(items.length ? items : ['{gray-fg}No labels yet{/gray-fg}']);
    panel.setLabel(` Labels (${items.length}) `);
    screen.render();
  }

  function promptAdd(expression) {
    if (!expression) return;
    const existing = getLabel(expression) || '';
    const prompt = blessed.prompt({
      parent: screen,
      top: 'center',
      left: 'center',
      width: 50,
      height: 8,
      border: { type: 'line' },
      style: { border: { fg: 'yellow' } },
      label: ' Set Label ',
    });
    prompt.input(`Label for: ${expression}`, existing, (err, value) => {
      prompt.destroy();
      if (err || !value) { screen.render(); return; }
      try {
        setLabel(expression, value);
      } catch (e) {
        // ignore
      }
      refresh(expression);
    });
    screen.render();
  }

  function deleteSelected() {
    const all = listLabels();
    const keys = Object.keys(all);
    const idx = list.selected;
    if (idx == null || !keys[idx]) return;
    removeLabel(keys[idx]);
    refresh();
  }

  list.key(['d', 'delete'], deleteSelected);

  return { panel, refresh, promptAdd, deleteSelected, getSelectedExpression: () => {
    const all = listLabels();
    const keys = Object.keys(all);
    return keys[list.selected] || null;
  }};
}

module.exports = { createLabelPanel };
