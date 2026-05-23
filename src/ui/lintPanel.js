const blessed = require('blessed');
const { lintExpression, formatLintResult } = require('../cron/lint');

function createLintPanel(screen, parent) {
  const box = blessed.box({
    parent,
    label: ' Lint ',
    border: { type: 'line' },
    style: {
      border: { fg: 'yellow' },
      label: { fg: 'yellow' },
    },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    width: '100%',
    height: '100%',
    padding: { left: 1, right: 1 },
    tags: true,
  });

  let currentExpression = '';

  function refresh(expression) {
    if (!expression || expression === currentExpression) return;
    currentExpression = expression;

    const result = lintExpression(expression);
    const lines = [];

    lines.push(`{bold}Expression:{/bold} ${expression}`);
    lines.push('');

    if (!result.valid) {
      lines.push('{red-fg}✗ Invalid{/red-fg}');
      result.errors.forEach((e) => lines.push(`  {red-fg}${e}{/red-fg}`));
    } else {
      lines.push('{green-fg}✓ Valid{/green-fg}');
      if (result.description) {
        lines.push(`  {cyan-fg}${result.description}{/cyan-fg}`);
      }
      if (result.warnings.length > 0) {
        lines.push('');
        lines.push('{yellow-fg}Warnings:{/yellow-fg}');
        result.warnings.forEach((w) => lines.push(`  {yellow-fg}⚠ ${w}{/yellow-fg}`));
      } else {
        lines.push('');
        lines.push('{green-fg}No warnings.{/green-fg}');
      }
    }

    box.setContent(lines.join('\n'));
    screen.render();
  }

  function clear() {
    currentExpression = '';
    box.setContent('');
    screen.render();
  }

  return { box, refresh, clear };
}

module.exports = { createLintPanel };
