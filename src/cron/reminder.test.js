const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-reminder-'));
  process.env.HOME = tmpDir;
  jest.resetModules();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function getModule() {
  return require('./reminder');
}

test('loadReminders returns empty object when no file exists', () => {
  const { loadReminders } = getModule();
  expect(loadReminders()).toEqual({});
});

test('setReminder stores a reminder', () => {
  const { setReminder, getReminder } = getModule();
  setReminder('* * * * *', 'Test reminder', 10);
  const r = getReminder('* * * * *');
  expect(r).not.toBeNull();
  expect(r.message).toBe('Test reminder');
  expect(r.minutesBefore).toBe(10);
});

test('setReminder uses default minutesBefore of 5', () => {
  const { setReminder, getReminder } = getModule();
  setReminder('0 * * * *', 'Hourly reminder');
  expect(getReminder('0 * * * *').minutesBefore).toBe(5);
});

test('getReminder returns null for unknown expression', () => {
  const { getReminder } = getModule();
  expect(getReminder('0 0 * * *')).toBeNull();
});

test('deleteReminder removes an existing reminder', () => {
  const { setReminder, deleteReminder, getReminder } = getModule();
  setReminder('0 9 * * 1', 'Monday morning');
  expect(deleteReminder('0 9 * * 1')).toBe(true);
  expect(getReminder('0 9 * * 1')).toBeNull();
});

test('deleteReminder returns false for unknown expression', () => {
  const { deleteReminder } = getModule();
  expect(deleteReminder('0 0 1 1 *')).toBe(false);
});

test('listReminders returns all reminders', () => {
  const { setReminder, listReminders } = getModule();
  setReminder('* * * * *', 'A');
  setReminder('0 * * * *', 'B');
  const all = listReminders();
  expect(Object.keys(all)).toHaveLength(2);
});
