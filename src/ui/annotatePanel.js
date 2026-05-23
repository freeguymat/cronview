import blessed from 'blessed';
import { annotateExpression, formatAnnotation } from '../cron/annotate.js';
import { setNote, deleteNote } from '../cron/notes.js';
import { addTag, removeTag } from '../cron/tags.js';

export function createAnnotatePanel(screen, parent) {
  const box = blessed.box({
    parent,
    label: ' Annotation ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    width: '100%',
    height: '100%',
    scrollable: true,
    keys: true,
    tags: true,
  });

  let currentExpression = null;

  function refresh(expression) {
    currentExpression = expression;
    if (!expression) {
      box.setContent('{grey-fg}No expression selected.{/grey-fg}');
      screen.render();
      return;
    }
    const ann = annotateExpression(expression);
    box.setContent(formatAnnotation(ann));
    screen.render();
  }

  function promptAddTag() {
    if (!currentExpression) return;
    const input = blessed.prompt({
      parent: screen,
      top: 'center',
      left: 'center',
      width: 40,
      height: 7,
      label: ' Add Tag ',
      border: { type: 'line' },
    });
    input.input('Tag name:', '', (err, value) => {
      input.destroy();
      if (!err && value && value.trim()) {
        addTag(currentExpression, value.trim());
        refresh(currentExpression);
      }
    });
  }

  function promptEditNote() {
    if (!currentExpression) return;
    const ann = annotateExpression(currentExpression);
    const input = blessed.prompt({
      parent: screen,
      top: 'center',
      left: 'center',
      width: 50,
      height: 7,
      label: ' Edit Note ',
      border: { type: 'line' },
    });
    input.input('Note:', ann.note || '', (err, value) => {
      input.destroy();
      if (!err) {
        if (value && value.trim()) {
          setNote(currentExpression, value.trim());
        } else {
          deleteNote(currentExpression);
        }
        refresh(currentExpression);
      }
    });
  }

  box.key('t', promptAddTag);
  box.key('n', promptEditNote);

  return { box, refresh, promptAddTag, promptEditNote };
}
