const { handleExpressionInput, bindKeys } = require('./handlers');
const { createTagsPanel } = require('./tagsPanel');
const { addTag } = require('../cron/tags');

// Re-export existing handlers with tags integration
function bindTagKeys(screen, tagsPanel, getExpression) {
  screen.key(['t'], () => {
    const expr = getExpression();
    if (!expr) return;
    const prompt = require('blessed').textbox({
      parent: screen,
      top: 'center',
      left: 'center',
      width: 40,
      height: 3,
      border: { type: 'line' },
      label: ' Add Tag ',
      style: { border: { fg: 'yellow' } },
      inputOnFocus: true,
    });
    prompt.focus();
    prompt.readInput((err, value) => {
      prompt.destroy();
      if (!err && value && value.trim()) {
        addTag(expr, value.trim());
        tagsPanel.refresh(expr);
      }
      screen.render();
    });
  });

  screen.key(['T'], () => {
    const expr = getExpression();
    if (!expr) return;
    tagsPanel.removeSelectedTag();
  });
}

module.exports = { handleExpressionInput, bindKeys, bindTagKeys };
