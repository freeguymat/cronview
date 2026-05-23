jest.mock('blessed', () => {
  const box = () => ({
    setContent: jest.fn(),
    key: jest.fn(),
    destroy: jest.fn(),
  });
  const prompt = () => ({
    input: jest.fn(),
    destroy: jest.fn(),
  });
  return { box, prompt };
});

jest.mock('../cron/reminder', () => ({
  listReminders: jest.fn(),
  setReminder: jest.fn(),
  deleteReminder: jest.fn(),
  getUpcomingReminders: jest.fn(),
}));

const blessed = require('blessed');
const { listReminders, deleteReminder, getUpcomingReminders } = require('../cron/reminder');
const { createReminderPanel } = require('./reminderPanel');

function makeScreen() {
  return { render: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  listReminders.mockReturnValue({});
  getUpcomingReminders.mockReturnValue([]);
});

test('createReminderPanel returns box, refresh, promptAdd, deleteCurrentReminder', () => {
  const screen = makeScreen();
  const panel = createReminderPanel(screen, '* * * * *');
  expect(panel).toHaveProperty('box');
  expect(panel).toHaveProperty('refresh');
  expect(panel).toHaveProperty('promptAdd');
  expect(panel).toHaveProperty('deleteCurrentReminder');
});

test('refresh shows no reminders message when empty', () => {
  const screen = makeScreen();
  const { box, refresh } = createReminderPanel(screen, '* * * * *');
  refresh();
  expect(box.setContent).toHaveBeenCalledWith(expect.stringContaining('No reminders set'));
});

test('refresh lists reminders when present', () => {
  listReminders.mockReturnValue({ '* * * * *': { message: 'hello', minutesBefore: 5 } });
  const screen = makeScreen();
  const { box, refresh } = createReminderPanel(screen, '* * * * *');
  refresh();
  expect(box.setContent).toHaveBeenCalledWith(expect.stringContaining('hello'));
});

test('refresh marks upcoming reminders with [soon]', () => {
  listReminders.mockReturnValue({ '* * * * *': { message: 'soon one', minutesBefore: 5 } });
  getUpcomingReminders.mockReturnValue([{ expression: '* * * * *' }]);
  const screen = makeScreen();
  const { box, refresh } = createReminderPanel(screen, '* * * * *');
  refresh();
  expect(box.setContent).toHaveBeenCalledWith(expect.stringContaining('[soon]'));
});

test('deleteCurrentReminder calls deleteReminder with current expression', () => {
  deleteReminder.mockReturnValue(true);
  listReminders.mockReturnValue({});
  const screen = makeScreen();
  const { deleteCurrentReminder } = createReminderPanel(screen, '0 9 * * 1');
  deleteCurrentReminder();
  expect(deleteReminder).toHaveBeenCalledWith('0 9 * * 1');
});
