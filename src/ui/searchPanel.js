import blessed from 'blessed';
import { searchExpressions, filterByTag } from '../cron/search.js';

export function createSearchPanel(screen, parent) {
  let currentResults = [];
  let onSelect = null;

  const box = blessed.box({
    parent,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: { type: 'line' },
    label: ' Search ',
    style: { border: { fg: 'cyan' } }
  });

  const input = blessed.textbox({
    parent: box,
    top: 1,
    left: 1,
    width: '100%-4',
    height: 3,
    border: { type: 'line' },
    style: { border: { fg: 'yellow' }, focus: { border: { fg: 'green' } } },
    inputOnFocus: true
  });

  const list = blessed.list({
    parent: box,
    top: 4,
    left: 1,
    width: '100%-4',
    height: '100%-6',
    keys: true,
    vi: true,
    style: { selected: { bg: 'blue' }, item: { fg: 'white' } },
    scrollbar: { ch: '|', style: { fg: 'cyan' } }
  });

  input.on('submit', (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      currentResults = [];
      renderResults();
      return;
    }
    currentResults = searchExpressions(trimmed);
    renderResults();
    list.focus();
  });

  list.on('select', (item, index) => {
    if (currentResults[index] && onSelect) {
      onSelect(currentResults[index].expression);
    }
  });

  function renderResults() {
    const items = currentResults.map(r => {
      const tag = r.tags.length ? ` [${r.tags.join(',')}]` : '';
      const src = `(${r.source})`;
      const label = r.label ? ` — ${r.label}` : '';
      return `${r.expression}${label}${tag} ${src}`;
    });
    list.setItems(items.length ? items : ['No results']);
    screen.render();
  }

  function focus() {
    input.focus();
    screen.render();
  }

  function onSelectExpression(cb) {
    onSelect = cb;
  }

  return { box, focus, onSelectExpression, renderResults };
}
