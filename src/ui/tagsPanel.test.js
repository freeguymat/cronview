const fs = require('fs');
const path = require('path');
const os = require('os');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cronview-tagspanel-'));
process.env.HOME = tmpDir;

jest.mock('blessed', () => {
  const makeEl = (opts = {}) => ({
    ...opts,
    setItems: jest.fn(),
    getItem: jest.fn(() => ({ content: 'hourly' })),
    selected: 0,
    key: jest.fn(),
  });
  return {
    box: jest.fn(() => makeEl()),
    list: jest.fn(() => makeEl()),
  };
});

const { createTagsPanel } = require('./tagsPanel');
const { addTag, getTagsForExpression } = require('../cron/tags');

const mockScreen = { render: jest.fn() };
const mockParent = {};

beforeEach(() => {
  const tagsFile = path.join(tmpDir, '.cronview', 'tags.json');
  if (fs.existsSync(tagsFile)) fs.unlinkSync(tagsFile);
  jest.clearAllMocks();
});

test('createTagsPanel returns expected interface', () => {
  const tp = createTagsPanel(mockScreen, mockParent);
  expect(tp).toHaveProperty('refresh');
  expect(tp).toHaveProperty('addTagToCurrentExpression');
  expect(tp).toHaveProperty('removeSelectedTag');
  expect(tp).toHaveProperty('getSelectedTag');
});

test('refresh calls setItems with tags for expression', () => {
  addTag('0 * * * *', 'hourly');
  const tp = createTagsPanel(mockScreen, mockParent);
  tp.refresh('0 * * * *');
  expect(tp.list.setItems).toHaveBeenCalledWith(['hourly']);
});

test('refresh shows placeholder when no tags', () => {
  const tp = createTagsPanel(mockScreen, mockParent);
  tp.refresh('5 5 5 5 5');
  expect(tp.list.setItems).toHaveBeenCalledWith(['(no tags)']);
});

test('addTagToCurrentExpression adds a tag', () => {
  const tp = createTagsPanel(mockScreen, mockParent);
  tp.refresh('0 0 * * *');
  tp.addTagToCurrentExpression('daily');
  expect(getTagsForExpression('0 0 * * *')).toContain('daily');
});
