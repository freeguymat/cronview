const blessed = require('blessed');
const { summarizeCron, formatRunDate } = require('../cron/index');
const { getNextRuns, validateExpression } = require('../cron/parser');

function createDashboard() {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'cronview'
  });

  const headerBox = blessed.box({
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    content: ' {bold}cronview{/bold} — cron expression visualizer',
    tags: true,
    style: { fg: 'cyan', bg: 'black' },
    border: { type: 'line' }
  });

  const inputBox = blessed.textbox({
    top: 3,
    left: 0,
    width: '100%',
    height: 3,
    label: ' Cron Expression ',
    inputOnFocus: true,
    border: { type: 'line' },
    style: { fg: 'white', border: { fg: 'yellow' } }
  });

  const runsBox = blessed.list({
    top: 6,
    left: 0,
    width: '60%',
    height: '60%',
    label: ' Next Runs ',
    border: { type: 'line' },
    style: { fg: 'green', border: { fg: 'blue' }, selected: { bg: 'blue' } },
    scrollable: true,
    keys: true
  });

  const infoBox = blessed.box({
    top: 6,
    left: '60%',
    width: '40%',
    height: '60%',
    label: ' Info ',
    border: { type: 'line' },
    style: { fg: 'white', border: { fg: 'magenta' } },
    tags: true
  });

  const statusBar = blessed.box({
    bottom: 0,
    left: 0,
    width: '100%',
    height: 1,
    content: ' Press Enter to evaluate | q to quit',
    style: { fg: 'black', bg: 'cyan' }
  });

  screen.append(headerBox);
  screen.append(inputBox);
  screen.append(runsBox);
  screen.append(infoBox);
  screen.append(statusBar);

  return { screen, inputBox, runsBox, infoBox, statusBar };
}

module.exports = { createDashboard };
