const blessed = require('blessed');
const { buildMonthCalendar, calendarSummary } = require('../cron/calendar');

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function createCalendarPanel(screen, parent) {
  const box = blessed.box({
    parent,
    label: ' Calendar ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    tags: true,
    scrollable: true,
  });

  let currentExpression = null;
  let viewYear = new Date().getFullYear();
  let viewMonth = new Date().getMonth() + 1;

  function refresh(expression) {
    if (expression) currentExpression = expression;
    if (!currentExpression) {
      box.setContent('{gray-fg}No expression selected{/gray-fg}');
      screen.render();
      return;
    }

    const cal = buildMonthCalendar(currentExpression, viewYear, viewMonth);
    const summary = calendarSummary(currentExpression, viewYear, viewMonth);
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

    const monthName = new Date(viewYear, viewMonth - 1).toLocaleString('default', { month: 'long' });
    let lines = [`{bold}{yellow-fg} ${monthName} ${viewYear}{/yellow-fg}{/bold}\n`];
    lines.push(DAY_NAMES.join('  ') + '\n');

    let row = ' '.repeat(firstDay * 4);
    for (let d = 1; d <= daysInMonth; d++) {
      const hasRun = !!cal[d];
      const label = String(d).padStart(2, ' ');
      row += hasRun ? `{green-fg}${label}{/green-fg}` : `{gray-fg}${label}{/gray-fg}`;
      row += ' ';
      if ((firstDay + d) % 7 === 0) {
        lines.push(row + '\n');
        row = '';
      }
    }
    if (row.trim()) lines.push(row + '\n');

    lines.push(`\n{bold}Total runs:{/bold} ${summary.totalRuns}`);
    lines.push(`{bold}Active days:{/bold} ${summary.activeDays}`);
    if (summary.busiestDay) {
      lines.push(`{bold}Busiest day:{/bold} ${summary.busiestDay} (${summary.busiestCount} runs)`);
    }

    box.setContent(lines.join('\n'));
    screen.render();
  }

  function prevMonth() {
    viewMonth--;
    if (viewMonth < 1) { viewMonth = 12; viewYear--; }
    refresh();
  }

  function nextMonth() {
    viewMonth++;
    if (viewMonth > 12) { viewMonth = 1; viewYear++; }
    refresh();
  }

  return { box, refresh, prevMonth, nextMonth };
}

module.exports = { createCalendarPanel };
