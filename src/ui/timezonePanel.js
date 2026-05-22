const blessed = require('blessed');
const { listCommonTimezones, isValidTimezone } = require('../cron/timezone');

function createTimezonePanel(screen, parent, options = {}) {
  const { top = 0, left = 0, width = 30, height = 20, onSelect } = options;

  const box = blessed.box({
    parent,
    top,
    left,
    width,
    height,
    label: ' Timezone ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
  });

  const list = blessed.list({
    parent: box,
    top: 0,
    left: 0,
    width: '100%-2',
    height: '100%-2',
    keys: true,
    vi: true,
    mouse: true,
    scrollable: true,
    scrollbar: { ch: '│', style: { fg: 'cyan' } },
    style: {
      selected: { bg: 'cyan', fg: 'black' },
      item: { fg: 'white' },
    },
  });

  const timezones = listCommonTimezones();

  function refresh() {
    list.clearItems();
    timezones.forEach(({ name, offset }) => {
      list.addItem(`${name} (${offset})`);
    });
    screen.render();
  }

  function getSelectedTimezone() {
    const idx = list.selected;
    return timezones[idx] ? timezones[idx].name : 'UTC';
  }

  list.on('select', () => {
    const tz = getSelectedTimezone();
    if (onSelect) onSelect(tz);
  });

  refresh();

  return { box, list, refresh, getSelectedTimezone };
}

module.exports = { createTimezonePanel };
