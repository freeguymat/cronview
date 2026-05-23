import blessed from 'blessed';
import { repeatSummary, haveSameInterval } from '../cron/repeat.js';

/**
 * Creates a panel that shows the repeat interval info for a cron expression
 * and optionally compares it against a second expression.
 */
export function createRepeatPanel(screen, options = {}) {
  const box = blessed.box({
    label: ' Repeat Interval ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    padding: { left: 1, right: 1 },
    ...options,
  });

  let _expression = '';
  let _compareExpression = '';

  function refresh(expression, compareExpression = '') {
    _expression = expression || '';
    _compareExpression = compareExpression || '';

    if (!_expression) {
      box.setContent('{gray-fg}No expression set.{/gray-fg}');
      screen.render();
      return;
    }

    try {
      const summary = repeatSummary(_expression);
      let lines = [
        `{bold}Expression:{/bold}  ${_expression}`,
        `{bold}Interval:{/bold}    ${summary.description}`,
        `{bold}Ms:{/bold}          ${summary.intervalMs != null ? summary.intervalMs : 'N/A'}`,
      ];

      if (_compareExpression) {
        const same = haveSameInterval(_expression, _compareExpression);
        const cmpSummary = repeatSummary(_compareExpression);
        lines.push('');
        lines.push(`{bold}Compare:{/bold}     ${_compareExpression}`);
        lines.push(`{bold}Cmp Interval:{/bold} ${cmpSummary.description}`);
        lines.push(`{bold}Same interval:{/bold} ${same ? '{green-fg}yes{/green-fg}' : '{red-fg}no{/red-fg}'}`);
      }

      box.setContent(lines.join('\n'));
    } catch (err) {
      box.setContent(`{red-fg}Error: ${err.message}{/red-fg}`);
    }

    screen.render();
  }

  function getExpression() {
    return _expression;
  }

  screen.append(box);

  return { box, refresh, getExpression };
}
