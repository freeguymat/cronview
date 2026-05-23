const fs = require('fs');
const path = require('path');
const { getNextRuns } = require('./parser');

const REMINDERS_FILE = path.join(process.env.HOME || '.', '.cronview', 'reminders.json');

function ensureDir() {
  const dir = path.dirname(REMINDERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadReminders() {
  ensureDir();
  if (!fs.existsSync(REMINDERS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(REMINDERS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveReminders(reminders) {
  ensureDir();
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2));
}

function setReminder(expression, message, minutesBefore = 5) {
  const reminders = loadReminders();
  reminders[expression] = { message, minutesBefore, createdAt: new Date().toISOString() };
  saveReminders(reminders);
  return reminders[expression];
}

function getReminder(expression) {
  const reminders = loadReminders();
  return reminders[expression] || null;
}

function deleteReminder(expression) {
  const reminders = loadReminders();
  if (!reminders[expression]) return false;
  delete reminders[expression];
  saveReminders(reminders);
  return true;
}

function listReminders() {
  return loadReminders();
}

function getUpcomingReminders(withinMinutes = 60) {
  const reminders = loadReminders();
  const now = new Date();
  const results = [];

  for (const [expression, reminder] of Object.entries(reminders)) {
    try {
      const [nextRun] = getNextRuns(expression, 1);
      if (!nextRun) continue;
      const msUntilRun = new Date(nextRun) - now;
      const msUntilReminder = msUntilRun - reminder.minutesBefore * 60 * 1000;
      if (msUntilReminder >= 0 && msUntilReminder <= withinMinutes * 60 * 1000) {
        results.push({ expression, ...reminder, nextRun, minutesUntilRun: Math.round(msUntilRun / 60000) });
      }
    } catch {
      // skip invalid expressions
    }
  }

  return results;
}

module.exports = { loadReminders, saveReminders, setReminder, getReminder, deleteReminder, listReminders, getUpcomingReminders };
