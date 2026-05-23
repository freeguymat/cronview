const blessed = require('blessed');
const { groupByTag, groupByFrequency, listGroups } = require('../cron/group');

/**
 * Create a panel for viewing expressions grouped by tag or frequency.
 */
function createGroupPanel(parent, expressions) {
  let currentMode = 'tag'; // 'tag' | 'frequency'
  let grouped = {};

  const box = blessed.box({
    parent,
    label: ' Groups ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    scrollable: true,
    keys: true,
    tags: true,
  });

  const modeLabel = blessed.text({
    parent: box,
    top: 0,
    left: 1,
    content: 'Mode: [T]ag | [F]requency',
    style: { fg: 'yellow' },
  });

  const list = blessed.list({
    parent: box,
    top: 2,
    left: 1,
    width: '98%',
    height: '90%',
    keys: true,
    mouse: true,
    style: {
      selected: { bg: 'blue', fg: 'white' },
      item: { fg: 'white' },
    },
  });

  function refresh(exprs) {
    grouped = currentMode === 'tag'
      ? groupByTag(exprs || expressions)
      : groupByFrequency(exprs || expressions);

    const lines = [];
    for (const key of listGroups(grouped)) {
      lines.push(`{bold}{cyan-fg}[${key}]{/cyan-fg}{/bold} (${grouped[key].length})`);
      for (const expr of grouped[key]) {
        lines.push(`  ${expr}`);
      }
    }
    list.setItems(lines.length ? lines : ['No expressions to group.']);
    box.screen && box.screen.render();
  }

  box.key('t', () => {
    currentMode = 'tag';
    modeLabel.setContent('Mode: {underline}[T]ag{/underline} | [F]requency');
    refresh();
  });

  box.key('f', () => {
    currentMode = 'frequency';
    modeLabel.setContent('Mode: [T]ag | {underline}[F]requency{/underline}');
    refresh();
  });

  refresh();

  return { box, refresh, getMode: () => currentMode };
}

module.exports = { createGroupPanel };
