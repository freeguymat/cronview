import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAnnotatePanel } from './annotatePanel.js';

vi.mock('../cron/annotate.js', () => ({
  annotateExpression: vi.fn(() => ({
    expression: '0 9 * * 1',
    description: 'At 09:00 on Monday',
    tags: ['work'],
    note: 'Standup',
  })),
  formatAnnotation: vi.fn(() => 'Expression : 0 9 * * 1\nTags       : work\nNote       : Standup'),
}));

vi.mock('../cron/notes.js', () => ({
  setNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock('../cron/tags.js', () => ({
  addTag: vi.fn(),
  removeTag: vi.fn(),
}));

function makeScreen() {
  return {
    render: vi.fn(),
    key: vi.fn(),
    append: vi.fn(),
  };
}

function makeParent() {
  return {};
}

vi.mock('blessed', () => ({
  default: {
    box: vi.fn(() => ({
      setContent: vi.fn(),
      key: vi.fn(),
      on: vi.fn(),
    })),
    prompt: vi.fn(() => ({
      input: vi.fn(),
      destroy: vi.fn(),
    })),
  },
}));

describe('createAnnotatePanel', () => {
  let screen, panel;

  beforeEach(() => {
    screen = makeScreen();
    panel = createAnnotatePanel(screen, makeParent());
  });

  it('returns box, refresh, promptAddTag, promptEditNote', () => {
    expect(panel.box).toBeDefined();
    expect(typeof panel.refresh).toBe('function');
    expect(typeof panel.promptAddTag).toBe('function');
    expect(typeof panel.promptEditNote).toBe('function');
  });

  it('refresh with expression calls setContent', () => {
    panel.refresh('0 9 * * 1');
    expect(panel.box.setContent).toHaveBeenCalledWith(
      expect.stringContaining('0 9 * * 1')
    );
    expect(screen.render).toHaveBeenCalled();
  });

  it('refresh with no expression shows placeholder', () => {
    panel.refresh(null);
    expect(panel.box.setContent).toHaveBeenCalledWith(
      expect.stringContaining('No expression selected')
    );
  });

  it('promptAddTag does nothing without current expression', () => {
    const { addTag } = await import('../cron/tags.js');
    panel.refresh(null);
    panel.promptAddTag();
    expect(addTag).not.toHaveBeenCalled();
  });
});
