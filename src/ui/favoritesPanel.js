/**
 * Favorites panel UI component — renders saved cron expressions in the dashboard
 */

const blessed = require('blessed');
const { listFavorites, addFavorite, removeFavorite } = require('../cron/favorites');

function createFavoritesPanel(screen, parent) {
  const panel = blessed.list({
    parent,
    label: ' ★ Favorites ',
    top: 0,
    right: 0,
    width: '30%',
    height: '50%',
    border: { type: 'line' },
    style: {
      border: { fg: 'yellow' },
      label: { fg: 'yellow', bold: true },
      selected: { bg: 'blue', fg: 'white' },
      item: { fg: 'white' }
    },
    keys: true,
    mouse: true,
    scrollable: true,
    scrollbar: { ch: '│', style: { fg: 'yellow' } }
  });

  function refresh() {
    const items = listFavorites();
    panel.setItems(items.length > 0
      ? items.map(f => `${f.label}`)
      : ['No favorites yet. Press (a) to add.']
    );
    screen.render();
  }

  function getSelectedExpression() {
    const items = listFavorites();
    const idx = panel.selected;
    return items[idx] ? items[idx].expression : null;
  }

  panel.key(['a'], () => {
    const prompt = blessed.prompt({
      parent: screen,
      top: 'center',
      left: 'center',
      width: '50%',
      height: 'shrink',
      border: { type: 'line' },
      label: ' Add Favorite ',
      style: { border: { fg: 'green' } }
    });
    prompt.input('Enter cron expression:', '', (err, value) => {
      if (!err && value) {
        addFavorite(value.trim());
        refresh();
      }
      prompt.destroy();
      screen.render();
    });
  });

  panel.key(['d', 'delete'], () => {
    const expr = getSelectedExpression();
    if (expr) {
      removeFavorite(expr);
      refresh();
    }
  });

  refresh();

  return { panel, refresh, getSelectedExpression };
}

module.exports = { createFavoritesPanel };
