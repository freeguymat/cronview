import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSearchPanel } from './searchPanel.js';

vi.mock('../cron/search.js', () => ({
  searchExpressions: vi.fn(() => [
    { expression: '0 9 * * 1-5', label: 'Weekday morning', source: 'favorite', tags: ['work'], note: '' },
    { expression: '*/5 * * * *', label: '', source: 'history', tags: [], note: 'polling' }
  ]),
  filterByTag: vi.fn(() => [])
}));

const makeMockWidget = (extra = {}) => ({
  on: vi.fn(),
  focus: vi.fn(),
  setItems: vi.fn(),
  ...extra
});

const mockScreen = { render: vi.fn() };

vi.mock('blessed', () => ({
  default: {
    box: vi.fn(() => makeMockWidget()),
    textbox: vi.fn(() => makeMockWidget({ value: '' })),
    list: vi.fn(() => makeMockWidget())
  }
}));

describe('createSearchPanel', () => {
  it('returns expected interface', () => {
    const panel = createSearchPanel(mockScreen, {});
    expect(panel).toHaveProperty('box');
    expect(panel).toHaveProperty('focus');
    expect(panel).toHaveProperty('onSelectExpression');
    expect(panel).toHaveProperty('renderResults');
  });

  it('calls screen.render in renderResults', () => {
    const panel = createSearchPanel(mockScreen, {});
    panel.renderResults();
    expect(mockScreen.render).toHaveBeenCalled();
  });

  it('registers onSelectExpression callback', () => {
    const panel = createSearchPanel(mockScreen, {});
    const cb = vi.fn();
    panel.onSelectExpression(cb);
    // callback stored without throwing
    expect(cb).not.toHaveBeenCalled();
  });
});
