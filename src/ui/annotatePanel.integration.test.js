import { describe, it, expect, vi } from 'vitest';
import { annotateExpression, formatAnnotation, hasAnnotation } from '../cron/annotate.js';

vi.mock('../cron/notes.js', () => ({
  loadNotes: vi.fn(() => ({ '*/5 * * * *': 'Every 5 mins job' })),
  setNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock('../cron/tags.js', () => ({
  getTagsForExpression: vi.fn((expr) =>
    expr === '*/5 * * * *' ? ['infra', 'frequent'] : []
  ),
  addTag: vi.fn(),
  removeTag: vi.fn(),
}));

vi.mock('../cron/parser.js', () => ({
  describeExpression: vi.fn((expr) =>
    expr === '*/5 * * * *' ? 'Every 5 minutes' : 'Unknown'
  ),
}));

describe('annotate integration', () => {
  it('annotateExpression returns full annotation for known expression', () => {
    const ann = annotateExpression('*/5 * * * *');
    expect(ann.description).toBe('Every 5 minutes');
    expect(ann.tags).toContain('infra');
    expect(ann.note).toBe('Every 5 mins job');
  });

  it('formatAnnotation output contains all fields', () => {
    const ann = annotateExpression('*/5 * * * *');
    const text = formatAnnotation(ann);
    expect(text).toContain('Every 5 minutes');
    expect(text).toContain('infra');
    expect(text).toContain('Every 5 mins job');
  });

  it('hasAnnotation returns true for annotated expression', () => {
    expect(hasAnnotation('*/5 * * * *')).toBe(true);
  });

  it('hasAnnotation returns false for bare expression', () => {
    expect(hasAnnotation('0 0 1 1 *')).toBe(false);
  });

  it('formatAnnotation handles expression with no tags and no note gracefully', () => {
    const ann = {
      expression: '0 0 1 1 *',
      description: 'Unknown',
      tags: [],
      note: null,
    };
    const text = formatAnnotation(ann);
    expect(text).toContain('(none)');
  });
});
