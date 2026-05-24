import { buildHourlyHeatmap, buildDailyHeatmap, renderHeatmapChart } from './heatmap.js';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

function makeRuns(count, baseMs, stepMs) {
  return Array.from({ length: count }, (_, i) => new Date(baseMs + i * stepMs));
}

describe('buildHourlyHeatmap', () => {
  test('counts runs per hour of day', () => {
    const base = new Date('2024-01-15T00:00:00Z').getTime();
    const runs = makeRuns(24, base, HOUR);
    const map = buildHourlyHeatmap(runs);
    expect(map).toHaveLength(24);
    expect(map.every(b => b.count === 1)).toBe(true);
    expect(map[0].hour).toBe(0);
    expect(map[23].hour).toBe(23);
  });

  test('returns zero counts for empty runs', () => {
    const map = buildHourlyHeatmap([]);
    expect(map).toHaveLength(24);
    expect(map.every(b => b.count === 0)).toBe(true);
  });

  test('accumulates multiple runs in same hour', () => {
    const base = new Date('2024-01-15T06:00:00Z').getTime();
    const runs = [new Date(base), new Date(base + 10 * 60000), new Date(base + 20 * 60000)];
    const map = buildHourlyHeatmap(runs);
    expect(map[6].count).toBe(3);
  });
});

describe('buildDailyHeatmap', () => {
  test('counts runs per day of week', () => {
    const monday = new Date('2024-01-15T12:00:00Z').getTime(); // Monday
    const runs = Array.from({ length: 7 }, (_, i) => new Date(monday + i * DAY));
    const map = buildDailyHeatmap(runs);
    expect(map).toHaveLength(7);
    expect(map.every(b => b.count === 1)).toBe(true);
  });

  test('returns zero counts for empty runs', () => {
    const map = buildDailyHeatmap([]);
    expect(map).toHaveLength(7);
    expect(map.every(b => b.count === 0)).toBe(true);
  });

  test('labels days correctly', () => {
    const map = buildDailyHeatmap([]);
    expect(map[0].day).toBe('Sun');
    expect(map[1].day).toBe('Mon');
    expect(map[6].day).toBe('Sat');
  });
});

describe('renderHeatmapChart', () => {
  test('returns a non-empty string', () => {
    const base = new Date('2024-01-15T00:00:00Z').getTime();
    const runs = makeRuns(48, base, HOUR / 2);
    const chart = renderHeatmapChart(runs, 'hourly');
    expect(typeof chart).toBe('string');
    expect(chart.length).toBeGreaterThan(0);
  });

  test('supports daily mode', () => {
    const base = new Date('2024-01-15T00:00:00Z').getTime();
    const runs = makeRuns(14, base, DAY);
    const chart = renderHeatmapChart(runs, 'daily');
    expect(chart).toContain('Sun');
  });

  test('handles empty runs gracefully', () => {
    const chart = renderHeatmapChart([], 'hourly');
    expect(typeof chart).toBe('string');
  });
});
