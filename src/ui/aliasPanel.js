const blessed = require('blessed');
const { loadAliases, setAlias, removeAlias, resolveAlias } = require('../cron/alias');

function createAliasPanel(screen, parent) {
  const box = blessed.box({
    parent,
    label: ' Aliases ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    scrollable: true,
    keys: true,
    vi: true,
    width: '100%',
    height: '100%',
  });

  const list = blessed.list({
    parent: box,
    top: 0,
    left: 0,
    right: 0,
    bottom: 3,
    keys: true,
    vi: true,
    mouse: true,
    style: {
      selected: { bg: 'blue', fg: 'white' },
      item: { fg: 'white' },
    },
  });

  const hint = blessed.text({
    parent: box,
    bottom: 0,
    left: 1,
    height: 1,
    content: '[a] Add  [d] Delete  [Enter] Use',
    style: { fg: 'gray' },
  });

  function refresh() {
    const aliases = loadAliases();
    const items = Object.entries(aliases).map(([name, expr]) => `${name}  →  ${expr}`);
    list.setItems(items.length ? items : ['No aliases saved']);
    screen.render();
  }

  function getSelectedAlias() {
    const aliases = loadAliases();
    const keys = Object.keys(aliases);
    const idx = list.selected;
    return keys[idx] ? { name: keys[idx], expression: aliases[keys[idx]] } : null;
  }

  function promptAdd(currentExpression, cb) {
    const prompt = blessed.prompt({
      parent: screen,
      top: 'center',
      left: 'center',
      width: '50%',
      height: 'shrink',
      label: ' Alias Name ',
      border: { type: 'line' },
      style: { border: { fg: 'yellow' } },
    });
    prompt.input('Enter alias name:', '', (err, value) => {
      prompt.destroy();
      if (!err && value && value.trim()) {
        try {
          setAlias(value.trim(), currentExpression);
        } catch (e) { /* ignore */ }
        refresh();
      }
      if (cb) cb();
      screen.render();
    });
  }

  function deleteSelected() {
    const sel = getSelectedAlias();
    if (sel) {
      removeAlias(sel.name);
      refresh();
    }
  }

  list.key(['a'], () => promptAdd('* * * * *', null));
  list.key(['d', 'delete'], deleteSelected);

  refresh();

  return { box, list, refresh, getSelectedAlias, promptAdd, deleteSelected };
}

module.exports = { createAliasPanel };
