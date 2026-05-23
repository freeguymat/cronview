const blessed = require('blessed');
const { loadSnapshots, createSnapshot, deleteSnapshot } = require('../cron/snapshot');

function createSnapshotPanel(screen, expression) {
  const panel = blessed.box({
    label: ' Snapshots ',
    border: { type: 'line' },
    style: { border: { fg: 'cyan' }, label: { fg: 'white' } },
    scrollable: true,
    keys: true,
    vi: true,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  });

  let snapshots = [];
  let currentExpression = expression || '';

  function refresh(expr) {
    if (expr !== undefined) currentExpression = expr;
    snapshots = loadSnapshots();
    if (snapshots.length === 0) {
      panel.setContent('{gray-fg}No snapshots saved. Press (s) to save current.{/}');
    } else {
      const lines = snapshots.map((snap, i) => {
        const date = new Date(snap.createdAt).toLocaleString();
        return `{bold}[${i + 1}]{/bold} ${snap.name} — {cyan-fg}${snap.expression}{/} — saved ${date}\n` +
          snap.runs.slice(0, 2).map(r => `    ${new Date(r).toLocaleString()}`).join('\n');
      });
      panel.setContent(lines.join('\n\n'));
    }
    screen.render();
  }

  function promptSave() {
    if (!currentExpression) return;
    const input = blessed.prompt({
      parent: screen,
      top: 'center',
      left: 'center',
      height: 5,
      width: 40,
      border: 'line',
      label: ' Snapshot name '
    });
    input.input('Name this snapshot:', '', (err, value) => {
      if (!err && value && value.trim()) {
        createSnapshot(value.trim(), currentExpression, 5);
        refresh();
      }
      input.destroy();
      screen.render();
    });
  }

  function deleteSelected(index) {
    const snap = snapshots[index];
    if (snap) {
      deleteSnapshot(snap.name);
      refresh();
    }
  }

  panel.key(['s'], () => promptSave());

  refresh();

  return { panel, refresh, promptSave, deleteSelected };
}

module.exports = { createSnapshotPanel };
