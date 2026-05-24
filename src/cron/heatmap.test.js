const { buildHourlyHeatmap, buildDailyHeatmap, renderHeatmapChart } = require('./heatmap');

// Fixed reference date: Monday 2024-01-01 00:00:00 UTC
const BASE = new Date('2024-01-01T00:00:00.000Z');

describe('buildHourlyHeatmap', () => {
  test('returns 24 buckets', () => {
    const result = buildHourlyHeatmap('0 * * * *', 7, BASE);
    expect(result).toHaveLength(24);
  });

  test('each bucket has hour and count', () => {
    const result = buildHourlyHeatmap('0 * * * *', 1, BASE);
    result.forEach((entry, i) => {
      expect(entry.hour).toBe(i);
      expect(typeof entry.count).toBe('number');
    });
  });

  test('hourly expression produces count >= 1 per bucket over 7 days', () => {
    const result = buildHourlyHeatmap('0 * * * *', 7, BASE);
    result.forEach(entry => {
      expect(entry.count).toBeGreaterThanOrEqual(1);
    });
  });

  test('expression that never runs returns all zeros', () => {
    // 31st of February — never fires
    const result = buildHourlyHeatmap('0 0 31 2 *', 30, BASE);
    const total = result.reduce((s, e) => s + e.count, 0);
    expect(total).toBe(0);
  });

  test('daily midnight expression only increments hour 0', () => {
    const result = buildHourlyHeatmap('0 0 * * *', 10, BASE);
    expect(result[0].count).toBeGreaterThanOrEqual(1);
    const others = result.slice(1).reduce((s, e) => s + e.count, 0);
    expect(others).toBe(0);
  });
});

describe('buildDailyHeatmap', () => {
  test('returns 7 buckets', () => {
    const result = buildDailyHeatmap('0 * * * *', 14, BASE);
    expect(result).toHaveLength(7);
  });

  test('buckets have day, label, and count', () => {
    const result = buildDailyHeatmap('0 * * * *', 7, BASE);
    const LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    result.forEach((entry, i) => {
      expect(entry.day).toBe(i);
      expect(entry.label).toBe(LABELS[i]);
      expect(typeof entry.count).toBe('number');
    });
  });

  test('weekly expression on Monday only increments Monday bucket', () => {
    const result = buildDailyHeatmap('0 9 * * 1', 28, BASE);
    const monCount = result.find(e => e.label === 'Mon').count;
    expect(monCount).toBeGreaterThanOrEqual(1);
    const others = result.filter(e => e.label !== 'Mon').reduce((s, e) => s + e.count, 0);
    expect(others).toBe(0);
  });
});

describe('renderHeatmapChart', () => {
  test('returns (no data) for empty input', () => {
    expect(renderHeatmapChart([])).toBe('(no data)');
  });

  test('renders one line per bucket', () => {
    const heatmap = buildHourlyHeatmap('0 * * * *', 1, BASE);
    const chart = renderHeatmapChart(heatmap);
    const lines = chart.split('\n');
    expect(lines).toHaveLength(24);
  });

  test('each line contains a bar and count', () => {
    const heatmap = [{ hour: 0, count: 5 }, { hour: 1, count: 0 }];
    const chart = renderHeatmapChart(heatmap);
    expect(chart).toContain('|');
    expect(chart).toContain('5');
  });

  test('uses label key when available', () => {
    const heatmap = buildDailyHeatmap('0 9 * * 1', 7, BASE);
    const chart = renderHeatmapChart(heatmap, 'day');
    expect(chart).toContain('Mon');
  });
});
