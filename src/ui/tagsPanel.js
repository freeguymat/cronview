const blessed = require('blessed');
const { getTagsForExpression, addTag, removeTag, listAllTags } = require('../cron/tags');

function createTagsPanel(screen, parent) {
  const panel = blessed.box({
    parent,
    label: ' Tags ',
    border: { type: 'line' },
    style: { border: { fg: 'yellow' }, label: { fg: 'yellow' } },
    scrollable: true,
    keys: true,
    vi: true,
    width: '100%',
    height: '100%',
  });

  const list = blessed.list({
    parent: panel,
    top: 0,
    left: 0,
    width: '100%-2',
    height: '100%-2',
    keys: true,
    vi: true,
    mouse: true,
    style: {
      selected: { bg: 'yellow', fg: 'black' },
      item: { fg: 'white' },
    },
  });

  let currentExpression = null;

  function refresh(expression) {
    currentExpression = expression;
    const tags = expression ? getTagsForExpression(expression) : [];
    list.setItems(tags.length ? tags : ['(no tags)']);
    screen.render();
  }

  function addTagToCurrentExpression(tag) {
    if (!currentExpression || !tag) return;
    addTag(currentExpression, tag);
    refresh(currentExpression);
  }

  function removeSelectedTag() {
    if (!currentExpression) return;
    const selected = list.getItem(list.selected);
    if (!selected || selected.content === '(no tags)') return;
    removeTag(currentExpression, selected.content.trim());
    refresh(currentExpression);
  }

  function getSelectedTag() {
    const item = list.getItem(list.selected);
    return item ? item.content.trim() : null;
  }

  list.key(['d', 'delete'], () => removeSelectedTag());

  return { panel, list, refresh, addTagToCurrentExpression, removeSelectedTag, getSelectedTag };
}

module.exports = { createTagsPanel };
