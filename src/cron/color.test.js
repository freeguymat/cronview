const { colorForExpression, applyColor, colorizeExpression, frequencyBadge } = require('./color');

jest.mock('./repeat', () => ({
  getRepeatInterval: jest.fn(),
}));

const { getRepeatInterval } = require('./repeat');

describe('colorForExpression', () => {
  it('returns red for high-frequency expressions (< 60 min interval)', () => {
    getRepeatInterval.mockReturnValue(30);
    expect(colorForExpression('* * * * *')).toBe('red');
  });

  it('returns yellow for medium-frequency expressions (60–1439 min)', () => {
    getRepeatInterval.mockReturnValue(60);
    expect(colorForExpression('0 * * * *')).toBe('yellow');
  });

  it('returns green for low-frequency expressions (>= 1440 min)', () => {
    getRepeatInterval.mockReturnValue(1440);
    expect(colorForExpression('0 0 * * *')).toBe('green');
  });

  it('returns unknown when interval is null', () => {
    getRepeatInterval.mockReturnValue(null);
    expect(colorForExpression('invalid')).toBe('white');
  });

  it('returns unknown when getRepeatInterval throws', () => {
    getRepeatInterval.mockImplementation(() => { throw new Error('bad'); });
    expect(colorForExpression('bad expr')).toBe('white');
  });
});

describe('applyColor', () => {
  it('wraps text in ANSI codes for red', () => {
    const result = applyColor('hello', 'red');
    expect(result).toContain('hello');
    expect(result).toContain('\x1b[31m');
    expect(result).toContain('\x1b[0m');
  });

  it('falls back to white for unknown color', () => {
    const result = applyColor('hi', 'purple');
    expect(result).toContain('\x1b[37m');
  });
});

describe('colorizeExpression', () => {
  it('returns a colored string containing the expression', () => {
    getRepeatInterval.mockReturnValue(30);
    const result = colorizeExpression('* * * * *');
    expect(result).toContain('* * * * *');
    expect(result).toContain('\x1b[');
  });
});

describe('frequencyBadge', () => {
  it('returns [HIGH] badge for high-frequency', () => {
    getRepeatInterval.mockReturnValue(5);
    const badge = frequencyBadge('* * * * *');
    expect(badge).toContain('[HIGH]');
  });

  it('returns [MEDIUM] badge for medium-frequency', () => {
    getRepeatInterval.mockReturnValue(120);
    const badge = frequencyBadge('0 */2 * * *');
    expect(badge).toContain('[MEDIUM]');
  });

  it('returns [LOW] badge for low-frequency', () => {
    getRepeatInterval.mockReturnValue(10080);
    const badge = frequencyBadge('0 0 * * 0');
    expect(badge).toContain('[LOW]');
  });
});
