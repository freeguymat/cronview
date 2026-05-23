const { validateExpression, describeExpression } = require('./parser');

const WARNINGS = {
  everyMinute: '* * * * * runs every minute — may be too frequent',
  everySecond: 'Runs every second — very high frequency',
  nonStandardField: 'Expression uses non-standard field count',
  suspiciousRange: 'Range step may produce unexpected results',
};

function lintExpression(expr) {
  const issues = [];

  if (!expr || typeof expr !== 'string') {
    return { valid: false, errors: ['Expression must be a non-empty string'], warnings: [] };
  }

  const trimmed = expr.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length < 5 || parts.length > 6) {
    return {
      valid: false,
      errors: [`Expected 5 or 6 fields, got ${parts.length}`],
      warnings: [],
    };
  }

  const validation = validateExpression(trimmed);
  if (!validation.valid) {
    return { valid: false, errors: validation.errors || ['Invalid expression'], warnings: [] };
  }

  const warnings = [];

  if (trimmed === '* * * * *') {
    warnings.push(WARNINGS.everyMinute);
  }

  if (trimmed === '* * * * * *') {
    warnings.push(WARNINGS.everySecond);
  }

  parts.forEach((field) => {
    if (/\*\/1$/.test(field)) {
      warnings.push(`Field "${field}" uses */1 which is equivalent to *`);
    }
    const rangeStep = field.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (rangeStep) {
      const [, start, end, step] = rangeStep.map(Number);
      if (step > end - start) {
        warnings.push(`${WARNINGS.suspiciousRange}: ${field}`);
      }
    }
  });

  return { valid: true, errors: [], warnings, description: describeExpression(trimmed) };
}

function formatLintResult(result) {
  const lines = [];
  if (!result.valid) {
    lines.push('✗ Invalid expression:');
    result.errors.forEach((e) => lines.push(`  error: ${e}`));
  } else {
    lines.push('✓ Valid expression');
    if (result.description) lines.push(`  ${result.description}`);
    if (result.warnings.length > 0) {
      lines.push('  Warnings:');
      result.warnings.forEach((w) => lines.push(`  ⚠ ${w}`));
    }
  }
  return lines.join('\n');
}

module.exports = { lintExpression, formatLintResult };
