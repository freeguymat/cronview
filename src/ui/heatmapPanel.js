import blessed from 'blessed';
import { buildHourlyHeatmap, buildDailyHeatmap, renderHeatmapChart } from '../cron/heatmap.js';
import { getNextRuns } from '../cron/parser.js';

const MODES = ['hourly', 'daily'];

export function createHeatmapPanel(parent, screen) {
  const box = blessed.box({
    parent,
    label: ' Heatmap ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } },
    scrollable: true,
    keys: true,
    width: '100%',
    height: '100%',
  });

  let currentExpression = null;
  let modeIndex = 0;

  function getModeLabel() {
    return MODES[modeIndex];
  }

  function refresh(expression) {
    if (expression) currentExpression = expression;
    if (!currentExpression) {
      box.setContent('{center}No expression set{/center}');
      screen.render();
      return;
    }

    let runs;
    try {
      runs = getNextRuns(currentExpression, 200);
    } catch {
      box.setContent(`{red-fg}Invalid expression: ${currentExpression}{/red-fg}`);
      screen.render();
      return;
    }

    const mode = getModeLabel();
    const chart = renderHeatmapChart(runs, mode);
    const header = `{bold}Expression:{/bold} ${currentExpression}  {bold}Mode:{/bold} [${mode}]  (Tab: toggle)\n\n`;
    box.setContent(header + chart);
    box.setLabel(` Heatmap (${mode}) `);
    screen.render();
  }

  function toggleMode() {
    modeIndex = (modeIndex + 1) % MODES.length;
    refresh();
  }

  box.key(['tab'], toggleMode);

  box.key(['r'], () => refresh());

  return { box, refresh, toggleMode, getMode: getModeLabel };
}
