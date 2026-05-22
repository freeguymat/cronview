const { getNextRuns, validateExpression, describeExpression } = require('../cron/parser');
const { summarizeCron, formatRunDate } = require('../cron/index');

const DEFAULT_COUNT = 10;

function handleExpressionInput(expression, components) {
  const { runsBox, infoBox, statusBar, screen } = components;

  const trimmed = expression.trim();
  if (!trimmed) {
    statusBar.setContent(' No expression provided. Press Enter to evaluate | q to quit');
    screen.render();
    return;
  }

  const validation = validateExpression(trimmed);
  if (!validation.valid) {
    statusBar.setContent(` {red-fg}Error: ${validation.error}{/red-fg}`);
    runsBox.setItems(['Invalid expression']);
    infoBox.setContent('{red-fg}Invalid cron expression{/red-fg}');
    screen.render();
    return;
  }

  try {
    const runs = getNextRuns(trimmed, DEFAULT_COUNT);
    const formattedRuns = runs.map((date, i) => ` ${i + 1}. ${formatRunDate(date)}`);
    runsBox.setItems(formattedRuns);

    const summary = summarizeCron(trimmed);
    const description = describeExpression(trimmed);
    const infoContent = [
      `{bold}Expression:{/bold} ${trimmed}`,
      `{bold}Description:{/bold} ${description}`,
      '',
      `{bold}Summary:{/bold}`,
      `  Schedule: ${summary.schedule}`,
      `  Next run: ${summary.nextRun}`,
      `  Frequency: ${summary.frequency}`
    ].join('\n');

    infoBox.setContent(infoContent);
    statusBar.setContent(' Press Enter to evaluate | q to quit');
  } catch (err) {
    statusBar.setContent(` {red-fg}Error: ${err.message}{/red-fg}`);
  }

  screen.render();
}

function bindKeys(screen, inputBox, components) {
  screen.key(['q', 'C-c'], () => process.exit(0));

  screen.key('tab', () => {
    inputBox.focus();
    screen.render();
  });

  inputBox.key('enter', () => {
    const value = inputBox.getValue();
    handleExpressionInput(value, { ...components, screen });
  });

  inputBox.focus();
}

module.exports = { handleExpressionInput, bindKeys };
