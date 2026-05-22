const { DateTime } = require('luxon');

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
];

function isValidTimezone(tz) {
  try {
    const dt = DateTime.now().setZone(tz);
    return dt.isValid;
  } catch {
    return false;
  }
}

function convertToTimezone(date, tz) {
  if (!isValidTimezone(tz)) {
    throw new Error(`Invalid timezone: ${tz}`);
  }
  return DateTime.fromJSDate(date).setZone(tz);
}

function formatInTimezone(date, tz, fmt = 'yyyy-MM-dd HH:mm:ss ZZZZ') {
  return convertToTimezone(date, tz).toFormat(fmt);
}

function getTimezoneOffset(tz) {
  if (!isValidTimezone(tz)) return null;
  const dt = DateTime.now().setZone(tz);
  return dt.toFormat('ZZ');
}

function listCommonTimezones() {
  return COMMON_TIMEZONES.map((tz) => ({
    name: tz,
    offset: getTimezoneOffset(tz),
  }));
}

module.exports = {
  isValidTimezone,
  convertToTimezone,
  formatInTimezone,
  getTimezoneOffset,
  listCommonTimezones,
  COMMON_TIMEZONES,
};
