const blessed = require('blessed');
const { getNote, setNote, deleteNote } = require('../cron/notes');

function createNotesPanel(screen, grid, currentExpressionFn) {
  const box = blessed.box({
    label: ' Notes ',
    border: { type: 'line' },
    style: { border: { fg: 'yellow' }, label: { fg: 'yellow' } },
    scrollable: true,
    keys: true,
    vi: true,
    padding: { left: 1, right: 1 },
  });

  const inputBox = blessed.textbox({
    bottom: 0,
    height: 3,
    inputOnFocus: true,
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, focus: { border: { fg: 'white' } } },
    hidden: true,
  });

  box.append(inputBox);

  function refresh() {
    const expr = currentExpressionFn();
    if (!expr) {
      box.setContent('{gray-fg}No expression selected{/gray-fg}');
      screen.render();
      return;
    }
    const note = getNote(expr);
    if (!note) {
      box.setContent('{gray-fg}No note for this expression.\nPress [e] to add one.{/gray-fg}');
    } else {
      const updated = new Date(note.updatedAt).toLocaleString();
      box.setContent(`{white-fg}${note.text}{/white-fg}\n\n{gray-fg}Updated: ${updated}{/gray-fg}`);
    }
    screen.render();
  }

  function promptEdit() {
    const expr = currentExpressionFn();
    if (!expr) return;
    const existing = getNote(expr);
    inputBox.setValue(existing ? existing.text : '');
    inputBox.show();
    inputBox.focus();
    screen.render();

    inputBox.once('submit', (value) => {
      inputBox.hide();
      if (value && value.trim()) {
        setNote(expr, value.trim());
      }
      refresh();
      box.focus();
    });

    inputBox.once('cancel', () => {
      inputBox.hide();
      refresh();
      box.focus();
    });
  }

  function deleteCurrentNote() {
    const expr = currentExpressionFn();
    if (expr) deleteNote(expr);
    refresh();
  }

  box.key(['e'], promptEdit);
  box.key(['d'], deleteCurrentNote);
  box.key(['r'], refresh);

  return { box, refresh, promptEdit, deleteCurrentNote };
}

module.exports = { createNotesPanel };
