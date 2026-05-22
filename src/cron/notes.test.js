const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('fs');
jest.mock('./favorites', () => ({ ensureDir: jest.fn() }));

const { setNote, getNote, deleteNote, listNotes } = require('./notes');

describe('notes', () => {
  beforeEach(() => {
    fs.existsSync.mockReturnValue(false);
    fs.writeFileSync.mockImplementation(() => {});
  });

  afterEach(() => jest.clearAllMocks());

  test('getNote returns null when no notes file', () => {
    expect(getNote('* * * * *')).toBeNull();
  });

  test('setNote saves a note for an expression', () => {
    fs.existsSync.mockReturnValue(false);
    const result = setNote('0 9 * * 1', 'Runs every Monday morning');
    expect(result.text).toBe('Runs every Monday morning');
    expect(result.updatedAt).toBeDefined();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  test('setNote throws on invalid expression', () => {
    expect(() => setNote('', 'some note')).toThrow('Invalid expression');
    expect(() => setNote(null, 'some note')).toThrow('Invalid expression');
  });

  test('getNote returns existing note', () => {
    const stored = { '* * * * *': { text: 'every minute', updatedAt: '2024-01-01T00:00:00.000Z' } };
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(stored));
    const note = getNote('* * * * *');
    expect(note.text).toBe('every minute');
  });

  test('deleteNote removes a note and returns true', () => {
    const stored = { '0 0 * * *': { text: 'midnight', updatedAt: '2024-01-01T00:00:00.000Z' } };
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(stored));
    const result = deleteNote('0 0 * * *');
    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  test('deleteNote returns false if note does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(deleteNote('0 0 * * *')).toBe(false);
  });

  test('listNotes returns all notes', () => {
    const stored = {
      '* * * * *': { text: 'every minute', updatedAt: '2024-01-01T00:00:00.000Z' },
      '0 9 * * 1': { text: 'monday morning', updatedAt: '2024-01-02T00:00:00.000Z' }
    };
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(stored));
    const notes = listNotes();
    expect(Object.keys(notes)).toHaveLength(2);
  });
});
