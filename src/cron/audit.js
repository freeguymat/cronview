// audit.js — track expression usage events for cronview
const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(process.env.HOME || '/tmp', '.cronview');
const AUDIT_FILE = path.join(AUDIT_DIR, 'audit.json');

function ensureDir() {
  if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

function loadAuditLog() {
  ensureDir();
  if (!fs.existsSync(AUDIT_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveAuditLog(log) {
  ensureDir();
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(log, null, 2));
}

function recordEvent(expression, action, meta = {}) {
  const log = loadAuditLog();
  const entry = {
    expression,
    action,
    timestamp: new Date().toISOString(),
    ...meta
  };
  log.push(entry);
  // keep last 500 entries
  if (log.length > 500) log.splice(0, log.length - 500);
  saveAuditLog(log);
  return entry;
}

function getEventsForExpression(expression) {
  return loadAuditLog().filter(e => e.expression === expression);
}

function getRecentEvents(limit = 20) {
  const log = loadAuditLog();
  return log.slice(-limit).reverse();
}

function clearAuditLog() {
  saveAuditLog([]);
}

function auditSummary() {
  const log = loadAuditLog();
  const counts = {};
  for (const entry of log) {
    counts[entry.action] = (counts[entry.action] || 0) + 1;
  }
  return { total: log.length, byAction: counts };
}

module.exports = {
  loadAuditLog,
  recordEvent,
  getEventsForExpression,
  getRecentEvents,
  clearAuditLog,
  auditSummary
};
