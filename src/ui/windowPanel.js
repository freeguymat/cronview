import blessed from 'blessed';
import { windowSummary, describeWindow } from '../cron/window.js';

export function createWindowPanel(screen, parent) {
  const box = blessed.box({
    parent,
    label: ' Time Window ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    width: '100%',
    height: '100%',
    padding: { left: 1, right: 1 },
    tags: true,
  });

  const content = blessed.text({
    parent: box,
    top: 0,
    left: 0,
    width: '100%-2',
    height: '100%-2',
    tags: true,
    content: 'Enter an expression to preview a time window.',
  });

  let state = {
    expression: null,
    hours: 24,
  };

  function refresh(expression, hours = 24) {
    state.expression = expression;
    state.hours = hours;

    if (!expression) {
      content.setContent('{gray-fg}No expression set.{/gray-fg}');
      screen.render();
      return;
    }

    const now = new Date();
    const end = new Date(now.getTime() + hours * 3600000);

    let summary;
    try {
      summary = windowSummary(expression, now, end);
    } catch (e) {
      content.setContent(`{red-fg}Error: ${e.message}{/red-fg}`);
      screen.render();
      return;
    }

    const span = describeWindow(now, end);
    const lines = [
      `{bold}Expression:{/bold} ${expression}`,
      `{bold}Window:{/bold}    next ${span}`,
      `{bold}Runs:{/bold}      ${summary.count}`,
    ];

    if (summary.first) {
      lines.push(`{bold}First:{/bold}     ${summary.first.toLocaleString()}`);
    }
    if (summary.last && summary.count > 1) {
      lines.push(`{bold}Last:{/bold}      ${summary.last.toLocaleString()}`);
    }
    if (summary.count === 0) {
      lines.push('{yellow-fg}No runs scheduled in this window.{/yellow-fg}');
    }

    content.setContent(lines.join('\n'));
    screen.render();
  }

  function getExpression() {
    return state.expression;
  }

  return { box, refresh, getExpression };
}
