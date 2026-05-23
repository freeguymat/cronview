import { describe, it, expect, vi, beforeEach } from 'vitest';
import { annotateExpression, formatAnnotation, hasAnnotation } from './annotate.js';

vi.mock('./notes.js', () => ({
  loadNotes: vi.fn(() => ({ '0 9 * * 1': 'Weekly standup reminder' })),
}));

vi.mock('./tags.js', () => ({
  getTagsForExpression: vi.fn((expr) =>
    expr === '0 9 * * 1' ? ['work', 'weekly'] : []
  ),
}));

vi.mock('./parser.js', () => ({
  describeExpression: vi.fn(() => 'At 09:00 on Monday'),
}));

describe('annotateExpression', () => {
  it('returns combined annotation object', () => {
    const result = annotateExpression('0 9 * * 1');
    expect(result.expression).toBe('0 9 * * 1');
    expect(result.description).toBe('At 09:00 on Monday');
    expect(result.tags).toEqual(['work', 'weekly']);
    expect(result.note).toBe('Weekly standup reminder');
  });

  it('returns null note when none set', () => {
    const result = annotateExpression('0 0 * * *');
    expect(result.note).toBeNull();
  });
});

describe('formatAnnotation', () => {
  it('formats annotation into readable lines', () => {
    const ann = {
      expression: '0 9 * * 1',
      description: 'At 09:00 on Monday',
      tags: ['work'],
      note: 'Standup',
    };
    const out = formatAnnotation(ann);
    expect(out).toContain('0 9 * * 1');
    expect(out).toContain('work');
    expect(out).toContain('Standup');
  });

  it('shows (none) placeholders when empty', () => {
    const ann = { expression: '* * * * *', description: 'Every minute', tags: [], note: null };
    const out = formatAnnotation(ann);
    expect(out).toContain('(none)');
  });
});

describe('hasAnnotation', () => {
  it('returns true when tags exist', () => {
    expect(hasAnnotation('0 9 * * 1')).toBe(true);
  });

  it('returns false when no tags and no note', () => {
    expect(hasAnnotation('0 0 * * *')).toBe(false);
  });
});
