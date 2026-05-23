const blessed = require('blessed');
const { listTemplates, listCategories, searchTemplates } = require('../cron/template');

function createTemplatePanel(parent, screen, onSelect) {
  const categories = listCategories();
  let currentCategory = null;
  let templates = listTemplates();

  const box = blessed.box({
    parent,
    label: ' Templates ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    width: '100%',
    height: '100%',
  });

  const filterBar = blessed.textbox({
    parent: box,
    top: 0,
    left: 0,
    width: '100%-2',
    height: 1,
    style: { fg: 'white', bg: 'black' },
    inputOnFocus: true,
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
      item: { fg: 'white' },
    },
  });

  function render(items) {
    templates = items;
    list.setItems(items.map(t => `{bold}${t.name}{/bold}  {gray-fg}${t.expression}{/gray-fg}`));
    screen.render();
  }

  function refresh() {
    const query = filterBar.getValue().trim();
    const items = query ? searchTemplates(query) : listTemplates();
    render(items);
  }

  filterBar.on('keypress', () => {
    setImmediate(refresh);
  });

  list.on('select', (_, idx) => {
    const selected = templates[idx];
    if (selected && typeof onSelect === 'function') {
      onSelect(selected.expression);
    }
  });

  function getSelectedExpression() {
    const idx = list.selected;
    return templates[idx] ? templates[idx].expression : null;
  }

  render(listTemplates());

  return { box, refresh, getSelectedExpression };
}

module.exports = { createTemplatePanel };
