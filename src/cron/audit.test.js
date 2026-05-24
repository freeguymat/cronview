const fs = require('fs');
const path = require('path');
const os = require('os');

let auditModule;
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-audit-'));

beforeEach(() => {
  jest.resetModules();
  process.env.HOME = tmpDir;
  auditModule = require('./audit');
  auditModule.clearAuditLog();
});

test('starts with empty log', () => {
  expect(auditModule.loadAuditLog()).toEqual([]);
});

test('recordEvent adds an entry', () => {
  auditModule.recordEvent('* * * * *', 'view');
  const log = auditModule.loadAuditLog();
  expect(log).toHaveLength(1);
  expect(log[0].expression).toBe('* * * * *');
  expect(log[0].action).toBe('view');
  expect(log[0].timestamp).toBeDefined();
});

test('recordEvent supports meta fields', () => {
  auditModule.recordEvent('0 9 * * 1', 'favorite', { user: 'test' });
  const log = auditModule.loadAuditLog();
  expect(log[0].user).toBe('test');
});

test('getEventsForExpression filters correctly', () => {
  auditModule.recordEvent('* * * * *', 'view');
  auditModule.recordEvent('0 9 * * 1', 'view');
  auditModule.recordEvent('* * * * *', 'export');
  const events = auditModule.getEventsForExpression('* * * * *');
  expect(events).toHaveLength(2);
  expect(events.every(e => e.expression === '* * * * *')).toBe(true);
});

test('getRecentEvents returns limited results in reverse order', () => {
  auditModule.recordEvent('a', 'view');
  auditModule.recordEvent('b', 'view');
  auditModule.recordEvent('c', 'view');
  const recent = auditModule.getRecentEvents(2);
  expect(recent).toHaveLength(2);
  expect(recent[0].expression).toBe('c');
});

test('clearAuditLog empties the log', () => {
  auditModule.recordEvent('* * * * *', 'view');
  auditModule.clearAuditLog();
  expect(auditModule.loadAuditLog()).toEqual([]);
});

test('auditSummary counts actions', () => {
  auditModule.recordEvent('* * * * *', 'view');
  auditModule.recordEvent('0 9 * * 1', 'view');
  auditModule.recordEvent('* * * * *', 'export');
  const summary = auditModule.auditSummary();
  expect(summary.total).toBe(3);
  expect(summary.byAction.view).toBe(2);
  expect(summary.byAction.export).toBe(1);
});
