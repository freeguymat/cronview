import { loadNotes } from './notes.js';
import { getTagsForExpression } from './tags.js';
import { describeExpression } from './parser.js';

/**
 * Build a full annotation object for a cron expression.
 * Combines description, tags, and note into one payload.
 */
export function annotateExpression(expression) {
  const description = describeExpression(expression);
  const tags = getTagsForExpression(expression);
  const notes = loadNotes();
  const note = notes[expression] || null;

  return {
    expression,
    description,
    tags,
    note,
  };
}

/**
 * Format annotation for display in a terminal panel.
 */
export function formatAnnotation(annotation) {
  const lines = [];
  lines.push(`Expression : ${annotation.expression}`);
  lines.push(`Description: ${annotation.description}`);
  lines.push(`Tags       : ${annotation.tags.length ? annotation.tags.join(', ') : '(none)'}`);
  lines.push(`Note       : ${annotation.note ? annotation.note : '(none)'}`);
  return lines.join('\n');
}

/**
 * Check whether an expression has any annotation (tag or note).
 */
export function hasAnnotation(expression) {
  const tags = getTagsForExpression(expression);
  const notes = loadNotes();
  return tags.length > 0 || Boolean(notes[expression]);
}
