const { createDashboard } = require('./dashboard');
const { bindKeys } = require('./handlers');

function startUI() {
  const { screen, inputBox, runsBox, infoBox, statusBar } = createDashboard();

  const components = { runsBox, infoBox, statusBar };

  bindKeys(screen, inputBox, components);

  screen.render();

  return screen;
}

function renderPreview(expression) {
  const { getNextRuns, validateExpression, describeExpression } = require('../cron/parser');
  const { formatRunDate } = require('../cron/index');

  const validation = validateExpression(expression);
  if (!validation.valid) {
    console.error(`Invalid expression: ${validation.error}`);
    process.exit(1);
  }

  console.log(`\nExpression: ${expression}`);
  console.log(`Description: ${describeExpression(expression)}`);
  console.log('\nNext 5 runs:');

  const runs = getNextRuns(expression, 5);
  runs.forEach((date, i) => {
    console.log(`  ${i + 1}. ${formatRunDate(date)}`);
  });

  console.log();
}

module.exports = { startUI, renderPreview };
