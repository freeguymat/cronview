const { lintExpression, formatLintResult } = require('./lint');

jest.mock('./parser', () => ({
  validateExpression: (expr) => {
    if (expr === 'bad expr') return { valid: false, errors: ['parse error'] };
    return { valid: true };
  },
  describeExpression: () => 'Every minute',
}));

describe('lintExpression', () => {
  test('returns error for non-string input', () => {
    const result = lintExpression(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/non-empty string/);
  });

  test('returns error for wrong field count', () => {
    const result = lintExpression('* * *');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Expected 5 or 6 fields/);
  });

  test('returns error when parser says invalid', () => {
    const result = lintExpression('bad expr');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('parse error');
  });

  test('warns on every-minute expression', () => {
    const result = lintExpression('* * * * *');
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('every minute'))).toBe(true);
  });

  test('warns on */1 redundant step', () => {
    const result = lintExpression('*/1 * * * *');
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('*/1'))).toBe(true);
  });

  test('warns on suspicious range step', () => {
    const result = lintExpression('1-3/5 * * * *');
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes('suspicious'))).toBe(true);
  });

  test('returns valid with no warnings for clean expression', () => {
    const result = lintExpression('0 9 * * 1');
    expect(result.valid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  test('includes description for valid expression', () => {
    const result = lintExpression('0 9 * * 1');
    expect(result.description).toBe('Every minute');
  });
});

describe('formatLintResult', () => {
  test('formats invalid result with errors', () => {
    const out = formatLintResult({ valid: false, errors: ['bad field'] });
    expect(out).toContain('✗');
    expect(out).toContain('bad field');
  });

  test('formats valid result with warnings', () => {
    const out = formatLintResult({
      valid: true,
      errors: [],
      warnings: ['too frequent'],
      description: 'Every minute',
    });
    expect(out).toContain('✓');
    expect(out).toContain('too frequent');
    expect(out).toContain('Every minute');
  });

  test('formats valid result with no warnings', () => {
    const out = formatLintResult({ valid: true, errors: [], warnings: [], description: 'Weekly' });
    expect(out).toContain('✓');
    expect(out).not.toContain('Warnings');
  });
});
