jest.mock('blessed');
jest.mock('../cron/notes');

const blessed = require('blessed');
const { getNote, setNote, deleteNote } = require('../cron/notes');
const { createNotesPanel } = require('./notesPanel');

describe('createNotesPanel', () => {
  let screen, box, inputBox, keyHandlers, currentExpr;

  beforeEach(() => {
    keyHandlers = {};
    inputBox = {
      setValue: jest.fn(),
      show: jest.fn(),
      hide: jest.fn(),
      focus: jest.fn(),
      once: jest.fn(),
    };
    box = {
      append: jest.fn(),
      setContent: jest.fn(),
      focus: jest.fn(),
      key: jest.fn((keys, fn) => { keys.forEach(k => { keyHandlers[k] = fn; }); }),
    };
    screen = { render: jest.fn() };
    blessed.box.mockReturnValue(box);
    blessed.textbox.mockReturnValue(inputBox);
    currentExpr = jest.fn(() => '* * * * *');
  });

  afterEach(() => jest.clearAllMocks());

  test('creates box and appends inputBox', () => {
    createNotesPanel(screen, {}, currentExpr);
    expect(blessed.box).toHaveBeenCalled();
    expect(box.append).toHaveBeenCalledWith(inputBox);
  });

  test('refresh shows no-note message when getNote returns null', () => {
    getNote.mockReturnValue(null);
    const { refresh } = createNotesPanel(screen, {}, currentExpr);
    refresh();
    expect(box.setContent).toHaveBeenCalledWith(expect.stringContaining('No note'));
    expect(screen.render).toHaveBeenCalled();
  });

  test('refresh shows note text when note exists', () => {
    getNote.mockReturnValue({ text: 'my note', updatedAt: '2024-06-01T10:00:00.000Z' });
    const { refresh } = createNotesPanel(screen, {}, currentExpr);
    refresh();
    expect(box.setContent).toHaveBeenCalledWith(expect.stringContaining('my note'));
  });

  test('refresh shows no-expression message when expression is empty', () => {
    currentExpr.mockReturnValue(null);
    const { refresh } = createNotesPanel(screen, {}, currentExpr);
    refresh();
    expect(box.setContent).toHaveBeenCalledWith(expect.stringContaining('No expression selected'));
  });

  test('deleteCurrentNote calls deleteNote and refreshes', () => {
    getNote.mockReturnValue(null);
    const { deleteCurrentNote } = createNotesPanel(screen, {}, currentExpr);
    deleteCurrentNote();
    expect(deleteNote).toHaveBeenCalledWith('* * * * *');
    expect(box.setContent).toHaveBeenCalled();
  });

  test('key bindings are registered for e, d, r', () => {
    createNotesPanel(screen, {}, currentExpr);
    expect(keyHandlers['e']).toBeDefined();
    expect(keyHandlers['d']).toBeDefined();
    expect(keyHandlers['r']).toBeDefined();
  });
});
