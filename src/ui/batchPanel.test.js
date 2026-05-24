const blessed = require('blessed');
const { createBatchPanel } = require('./batchPanel');

jest.mock('../cron/batch', () => ({
  batchEvaluate: jest.fn((exprs) =>
    exprs.map((expression) =>
      expression === 'bad'
        ? { expression, valid: false, runs: [], error: 'invalid' }
        : { expression, valid: true, runs: [new Date('2024-01-01T00:01:00Z'), new Date('2024-01-01T00:02:00Z'), new Date('2024-01-01T00:03:00Z')] }
    )
  ),
  batchSummary: jest.fn((results) => ({
    total: results.length,
    valid: results.filter((r) => r.valid).length,
    invalid: results.filter((r) => !r.valid).length,
  })),
}));

jest.mock('../cron/index', () => ({
  formatRunDate: jest.fn((d) => d.toISOString()),
}));

function makeScreen() {
  const screen = blessed.screen({ smartCSR: true });
  return screen;
}

describe('createBatchPanel', () => {
  let screen, parent, panel;

  beforeEach(() => {
    screen = makeScreen();
    parent = blessed.box({ parent: screen });
    panel = createBatchPanel(screen, parent);
  });

  afterEach(() => {
    screen.destroy();
  });

  it('creates a box element', () => {
    expect(panel.box).toBeDefined();
  });

  it('shows empty message when no expressions', () => {
    panel.refresh([]);
    const content = panel.box.getContent();
    expect(content).toMatch(/No expressions/);
  });

  it('renders valid and invalid expressions', () => {
    panel.refresh(['* * * * *', 'bad']);
    const content = panel.box.getContent();
    expect(content).toMatch(/Total/);
    expect(content).toMatch(/\* \* \* \* \*/);
    expect(content).toMatch(/bad/);
  });

  it('getExpressions returns current list', () => {
    panel.refresh(['0 * * * *', '0 0 * * *']);
    expect(panel.getExpressions()).toEqual(['0 * * * *', '0 0 * * *']);
  });

  it('getExpressions returns empty array initially', () => {
    expect(panel.getExpressions()).toEqual([]);
  });
});
