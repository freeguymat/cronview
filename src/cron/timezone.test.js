const {
  isValidTimezone,
  formatInTimezone,
  getTimezoneOffset,
  listCommonTimezones,
  convertToTimezone,
} = require('./timezone');

describe('isValidTimezone', () => {
  it('returns true for valid timezones', () => {
    expect(isValidTimezone('UTC')).toBe(true);
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('Asia/Tokyo')).toBe(true);
  });

  it('returns false for invalid timezones', () => {
    expect(isValidTimezone('Fake/Zone')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
    expect(isValidTimezone('notazone')).toBe(false);
  });
});

describe('convertToTimezone', () => {
  it('converts a date to the given timezone', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    const result = convertToTimezone(date, 'America/New_York');
    expect(result.zoneName).toBe('America/New_York');
    expect(result.hour).toBe(7);
  });

  it('throws on invalid timezone', () => {
    expect(() => convertToTimezone(new Date(), 'Bad/Zone')).toThrow();
  });
});

describe('formatInTimezone', () => {
  it('formats a date in the given timezone', () => {
    const date = new Date('2024-06-01T00:00:00Z');
    const result = formatInTimezone(date, 'UTC', 'yyyy-MM-dd HH:mm');
    expect(result).toBe('2024-06-01 00:00');
  });
});

describe('getTimezoneOffset', () => {
  it('returns offset string for valid timezone', () => {
    const offset = getTimezoneOffset('UTC');
    expect(offset).toBe('+00:00');
  });

  it('returns null for invalid timezone', () => {
    expect(getTimezoneOffset('Not/Real')).toBeNull();
  });
});

describe('listCommonTimezones', () => {
  it('returns array of timezone objects', () => {
    const list = listCommonTimezones();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('name');
    expect(list[0]).toHaveProperty('offset');
  });
});
