import blessed from 'blessed';
import { compareExpressions, findCommonRun, compareFrequency } from '../cron/compare.js';
import { formatRunDate } from '../cron/index.js';

export function createComparePanel(screen, expressions = []) {
  const box = blessed.box({
    label: ' Compare Expressions ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'white', bold: true } },
    scrollable: true,
    keys: true,
    vi: true,
    width: '100%',
    height: '100%',
  });

  let currentExpressions = [...expressions];

  function refresh(exprs, count = 5) {
    currentExpressions = exprs || currentExpressions;
    if (currentExpressions.length === 0) {
      box.setContent('{center}No expressions to compare.{/center}');
      screen.render();
      return;
    }

    const results = compareExpressions(currentExpressions, count);
    const lines = [];

    results.forEach(({ expression, runs }) => {
      lines.push(`{bold}{yellow-fg}${expression}{/yellow-fg}{/bold}`);
      runs.forEach((d, i) => {
        lines.push(`  ${i + 1}. ${formatRunDate(d)}`);
      });
      lines.push('');
    });

    if (currentExpressions.length >= 2) {
      const [a, b] = currentExpressions;
      const freq = compareFrequency(a, b, 24);
      const freqLabel =
        freq === 'equal'
          ? 'Both fire equally often in 24h'
          : freq === 'first'
          ? `"${a}" fires more often in 24h`
          : `"${b}" fires more often in 24h`;
      lines.push(`{cyan-fg}Frequency: ${freqLabel}{/cyan-fg}`);
      lines.push('');

      const common = findCommonRun(currentExpressions, 500);
      if (common.length > 0) {
        lines.push('{green-fg}Next common fire times:{/green-fg}');
        common.forEach((d) => lines.push(`  • ${formatRunDate(d)}`));
      } else {
        lines.push('{red-fg}No common fire time found in next 500 minutes.{/red-fg}');
      }
    }

    box.setContent(lines.join('\n'));
    screen.render();
  }

  function getExpressions() {
    return currentExpressions;
  }

  refresh();

  return { box, refresh, getExpressions };
}
