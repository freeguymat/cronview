const fs = require('fs');
const path = require('path');
const { ensureDir } = require('./favorites');

const NOTES_FILE = path.join(process.env.HOME || process.env.USERPROFILE, '.cronview', 'notes.json');

function loadNotes() {
  ensureDir();
  if (!fs.existsSync(NOTES_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveNotes(notes) {
  ensureDir();
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

function setNote(expression, note) {
  if (!expression || typeof expression !== 'string') throw new Error('Invalid expression');
  const notes = loadNotes();
  notes[expression] = { text: note.trim(), updatedAt: new Date().toISOString() };
  saveNotes(notes);
  return notes[expression];
}

function getNote(expression) {
  const notes = loadNotes();
  return notes[expression] || null;
}

function deleteNote(expression) {
  const notes = loadNotes();
  if (!notes[expression]) return false;
  delete notes[expression];
  saveNotes(notes);
  return true;
}

function listNotes() {
  return loadNotes();
}

module.exports = { loadNotes, saveNotes, setNote, getNote, deleteNote, listNotes };
