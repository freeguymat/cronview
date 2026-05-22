const fs = require('fs');
const path = require('path');
const os = require('os');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-tags-'));
process.env.HOME = tmpDir;

const { addTag, removeTag, getTagsForExpression, getExpressionsByTag, listAllTags, loadTags } = require('./tags');

beforeEach(() => {
  const tagsFile = path.join(tmpDir, '.cronview', 'tags.json');
  if (fs.existsSync(tagsFile)) fs.unlinkSync(tagsFile);
});

test('addTag creates a tag for an expression', () => {
  addTag('0 * * * *', 'hourly');
  expect(getTagsForExpression('0 * * * *')).toContain('hourly');
});

test('addTag does not duplicate tags', () => {
  addTag('0 * * * *', 'hourly');
  addTag('0 * * * *', 'hourly');
  expect(getTagsForExpression('0 * * * *').length).toBe(1);
});

test('removeTag removes a tag from an expression', () => {
  addTag('0 0 * * *', 'daily');
  removeTag('0 0 * * *', 'daily');
  expect(getTagsForExpression('0 0 * * *')).not.toContain('daily');
});

test('getExpressionsByTag returns all matching expressions', () => {
  addTag('0 * * * *', 'frequent');
  addTag('*/5 * * * *', 'frequent');
  const results = getExpressionsByTag('frequent');
  expect(results).toContain('0 * * * *');
  expect(results).toContain('*/5 * * * *');
});

test('listAllTags returns sorted unique tags', () => {
  addTag('0 * * * *', 'hourly');
  addTag('0 0 * * *', 'daily');
  addTag('0 0 * * 1', 'weekly');
  const tags = listAllTags();
  expect(tags).toEqual(['daily', 'hourly', 'weekly']);
});

test('returns empty array for untagged expression', () => {
  expect(getTagsForExpression('1 2 3 4 5')).toEqual([]);
});
