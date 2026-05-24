const blessed = require('blessed');
const { getRunTrend, classifyTrend, describeTrend } = require('../cron/trend');

const LABEL_COLORS = {
  'very-high': '{red-fg}',
  high: '{yellow-fg}',
  medium: '{green-fg}',
  low: '{cyan-fg}',
  rare: '{white-fg}',
};

function createTrendPanel(parent, options = {}) {
  const box = blessed.box({
    parent,
    label: ' Trend ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    tags: true,
    scrollable: true,
    top: options.top || 0,
    left: options.left || 0,
    width: options.width || '30%',
    height: options.height || 10,
  });

  let currentExpression = null;

  function refresh(expression, from = new Date()) {
    currentExpression = expression;

    if (!expression) {
      box.setContent('{grey-fg}No expression{/grey-fg}');
      box.screen && box.screen.render();
      return;
    }

    try {
      const trend = getRunTrend(expression, from);
      const label = classifyTrend(trend);
      const color = LABEL_COLORS[label] || '{white-fg}';
      const closeTag = color.replace('{', '{/');

      const lines = [
        `${color}Frequency: ${label}${closeTag}`,
        `Hourly:  ${trend.hourly}`,
        `Daily:   ${trend.daily}`,
        `Weekly:  ${trend.weekly}`,
        '',
        describeTrend(expression, from),
      ];

      box.setContent(lines.join('\n'));
    } catch (e) {
      box.setContent(`{red-fg}Error: ${e.message}{/red-fg}`);
    }

    box.screen && box.screen.render();
  }

  function getExpression() {
    return currentExpression;
  }

  return { box, refresh, getExpression };
}

module.exports = { createTrendPanel };
