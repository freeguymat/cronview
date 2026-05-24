import blessed from 'blessed';
import { scanForImminent } from '../cron/notify.js';

const POLL_INTERVAL_MS = 30_000;

export function createNotifyPanel(parent, screen, getExpressions) {
  const box = blessed.box({
    parent,
    label: ' Notifications ',
    border: { type: 'line' },
    style: {
      border: { fg: 'yellow' },
      label: { fg: 'yellow', bold: true },
    },
    scrollable: true,
    alwaysScroll: true,
    width: '100%',
    height: '100%',
    tags: true,
    padding: { left: 1, right: 1 },
  });

  let intervalId = null;

  function refresh() {
    const expressions = getExpressions();
    if (!expressions || expressions.length === 0) {
      box.setContent('{gray-fg}No expressions to watch.{/gray-fg}');
      screen.render();
      return;
    }

    const imminent = scanForImminent(expressions);

    if (imminent.length === 0) {
      box.setContent('{gray-fg}No runs imminent in the next 5 minutes.{/gray-fg}');
    } else {
      const lines = imminent.map(({ message }) =>
        `{yellow-fg}⚠{/yellow-fg}  ${message}`
      );
      box.setContent(lines.join('\n'));
    }

    screen.render();
  }

  function start() {
    refresh();
    intervalId = setInterval(refresh, POLL_INTERVAL_MS);
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  return { box, refresh, start, stop };
}
