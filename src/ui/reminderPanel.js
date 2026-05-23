const blessed = require('blessed');
const { listReminders, setReminder, deleteReminder, getUpcomingReminders } = require('../cron/reminder');

function createReminderPanel(screen, expression) {
  let currentExpression = expression || '';

  const box = blessed.box({
    label: ' Reminders ',
    border: { type: 'line' },
    style: { border: { fg: 'yellow' }, label: { fg: 'yellow' } },
    scrollable: true,
    keys: true,
    vi: true,
    width: '50%',
    height: '50%',
    top: 'center',
    left: 'center',
    padding: { left: 1, right: 1 },
  });

  function refresh(expr) {
    if (expr) currentExpression = expr;
    const reminders = listReminders();
    const upcoming = getUpcomingReminders(120);
    const upcomingSet = new Set(upcoming.map(u => u.expression));

    const lines = Object.entries(reminders).map(([exp, r]) => {
      const tag = upcomingSet.has(exp) ? '{yellow-fg}[soon]{/yellow-fg} ' : '';
      const active = exp === currentExpression ? '{green-fg}>{/green-fg} ' : '  ';
      return `${active}${tag}{bold}${exp}{/bold} — ${r.message} (${r.minutesBefore}m before)`;
    });

    box.setContent(lines.length ? lines.join('\n') : '{gray-fg}No reminders set.{/gray-fg}');
    screen.render();
  }

  function promptAdd() {
    if (!currentExpression) return;
    const input = blessed.prompt({
      parent: screen,
      border: 'line',
      height: 'shrink',
      width: '50%',
      top: 'center',
      left: 'center',
      label: ' Reminder message ',
      tags: true,
      keys: true,
      vi: true,
    });
    input.input('Enter reminder message:', '', (err, value) => {
      if (!err && value && value.trim()) {
        setReminder(currentExpression, value.trim());
        refresh();
      }
      input.destroy();
      screen.render();
    });
  }

  function deleteCurrentReminder() {
    if (!currentExpression) return;
    const deleted = deleteReminder(currentExpression);
    if (deleted) refresh();
  }

  box.key(['a'], promptAdd);
  box.key(['d', 'delete'], deleteCurrentReminder);

  return { box, refresh, promptAdd, deleteCurrentReminder };
}

module.exports = { createReminderPanel };
