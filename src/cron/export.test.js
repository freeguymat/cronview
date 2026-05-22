const fs = require('fs');
const os = require('os');
const path = require('path');
const { exportToJSON, exportToCSV, resolveOutputPath } = require('./export');

describe('exportToJSON', () => {
  let tmpFile;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `cronview-test-${Date.now()}.json`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('writes valid JSON with next runs for a valid expression', () => {
    exportToJSON(['* * * * *'], 'UTC', tmpFile, 3);
    const raw = fs.readFileSync(tmpFile, 'utf8');
    const data = JSON.parse(raw);
    expect(data).toHaveProperty('exportedAt');
    expect(data.entries).toHaveLength(1);
    expect(data.entries[0].expression).toBe('* * * * *');
    expect(data.entries[0].nextRuns).toHaveLength(3);
    expect(data.entries[0].error).toBeNull();
  });

  it('records error for invalid expression', () => {
    exportToJSON(['not-valid'], 'UTC', tmpFile, 3);
    const data = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
    expect(data.entries[0].error).toBeTruthy();
    expect(data.entries[0].nextRuns).toHaveLength(0);
  });

  it('handles multiple expressions', () => {
    exportToJSON(['* * * * *', '0 9 * * 1'], 'UTC', tmpFile, 2);
    const data = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
    expect(data.entries).toHaveLength(2);
  });
});

describe('exportToCSV', () => {
  let tmpFile;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `cronview-test-${Date.now()}.csv`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('writes CSV with header and data rows', () => {
    exportToCSV(['0 0 * * *'], 'UTC', tmpFile, 2);
    const raw = fs.readFileSync(tmpFile, 'utf8');
    const lines = raw.split('\n');
    expect(lines[0]).toBe('expression,description,timezone,run_index,run_time,error');
    expect(lines.length).toBeGreaterThan(2);
  });

  it('writes error row for invalid expression', () => {
    exportToCSV(['bad expr'], 'UTC', tmpFile, 2);
    const raw = fs.readFileSync(tmpFile, 'utf8');
    expect(raw).toContain('bad expr');
    const lines = raw.split('\n');
    expect(lines[1]).toContain(',0,,');
  });
});

describe('resolveOutputPath', () => {
  it('returns absolute path unchanged', () => {
    expect(resolveOutputPath('/tmp/out.json')).toBe('/tmp/out.json');
  });

  it('joins relative path with cwd', () => {
    const result = resolveOutputPath('out.json');
    expect(result).toBe(path.join(process.cwd(), 'out.json'));
  });
});
