const blessed = require('blessed');
const { diffExpressions } = require('../cron/diff');
const { formatInTimezone } = require('../cron/timezone');

function createDiffPanel(screen, grid) {
  const box = blessed.box({
    label: ' Diff ',
    border: { type: 'line' },
    style: { border: { fg: 'magenta' }, label: { fg: 'magenta' } },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    tags: true,
    padding: { left: 1, right: 1 },
  });

  if (grid) {
    grid.append(box);
  } else {
    screen.append(box);
  }

  function refresh(exprA, exprB, timezone = 'UTC', count = 8) {
    if (!exprA || !exprB) {
      box.setContent('{gray-fg}Enter two expressions to compare.{/gray-fg}');
      screen.render();
      return;
    }

    let result;
    try {
      result = diffExpressions(exprA, exprB, count, timezone);
    } catch (e) {
      box.setContent(`{red-fg}Error: ${e.message}{/red-fg}`);
      screen.render();
      return;
    }

    const lines = [];
    lines.push(`{bold}A:{/bold} ${exprA}   {bold}B:{/bold} ${exprB}   TZ: ${timezone}\n`);

    lines.push(`{green-fg}Shared (${result.shared.length}):{/green-fg}`);
    if (result.shared.length === 0) {
      lines.push('  {gray-fg}none{/gray-fg}');
    } else {
      result.shared.forEach((d) => lines.push(`  {green-fg}${formatInTimezone(d, timezone)}{/green-fg}`));
    }

    lines.push(`\n{yellow-fg}Only in A (${result.onlyInA.length}):{/yellow-fg}`);
    result.onlyInA.forEach((d) => lines.push(`  {yellow-fg}${formatInTimezone(d, timezone)}{/yellow-fg}`));

    lines.push(`\n{cyan-fg}Only in B (${result.onlyInB.length}):{/cyan-fg}`);
    result.onlyInB.forEach((d) => lines.push(`  {cyan-fg}${formatInTimezone(d, timezone)}{/cyan-fg}`));

    box.setContent(lines.join('\n'));
    screen.render();
  }

  return { box, refresh };
}

module.exports = { createDiffPanel };
