/**
 * chainPanel.js — blessed panel for visualizing job chains
 */

const blessed = require('blessed');
const { chainJobs, chainGaps, describeChain } = require('../cron/chain');

/**
 * @param {blessed.Widgets.Screen} screen
 * @param {blessed.Widgets.BoxElement} parent
 * @returns {{ box: blessed.Widgets.BoxElement, refresh: Function, setJobs: Function }}
 */
function createChainPanel(screen, parent) {
  let currentJobs = [];

  const box = blessed.box({
    parent,
    label: ' Job Chain ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'cyan', bold: true } },
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    width: '100%',
    height: '100%',
  });

  function refresh() {
    if (!currentJobs.length) {
      box.setContent('{gray-fg}No jobs loaded. Use setJobs() to add expressions.{/gray-fg}');
      screen.render();
      return;
    }

    const chain = chainJobs(currentJobs);
    const gaps = chainGaps(chain);
    const lines = [];

    lines.push('{bold}{cyan-fg}Execution Order:{/cyan-fg}{/bold}');
    chain.forEach((j, i) => {
      const ts = j.nextRun ? j.nextRun.toISOString() : 'N/A';
      lines.push(`  {yellow-fg}${i + 1}.{/yellow-fg} {white-fg}[${j.label}]{/white-fg} → {green-fg}${ts}{/green-fg}`);
      if (i < gaps.length) {
        const secs = Math.round(gaps[i].gapMs / 1000);
        const mins = Math.floor(secs / 60);
        const gapStr = mins > 0 ? `${mins}m ${secs % 60}s` : `${secs}s`;
        lines.push(`     {gray-fg}↕ gap: ${gapStr}{/gray-fg}`);
      }
    });

    box.setContent(lines.join('\n'));
    screen.render();
  }

  /**
   * @param {Array<{label: string, expression: string}>} jobs
   */
  function setJobs(jobs) {
    currentJobs = jobs || [];
    refresh();
  }

  return { box, refresh, setJobs };
}

module.exports = { createChainPanel };
