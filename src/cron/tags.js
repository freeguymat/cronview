const fs = require('fs');
const path = require('path');
const { ensureDir } = require('./favorites');

const TAGS_FILE = path.join(process.env.HOME || '.', '.cronview', 'tags.json');

function loadTags() {
  ensureDir();
  if (!fs.existsSync(TAGS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(TAGS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveTags(tags) {
  ensureDir();
  fs.writeFileSync(TAGS_FILE, JSON.stringify(tags, null, 2));
}

function addTag(expression, tag) {
  if (!expression || !tag) return false;
  const tags = loadTags();
  if (!tags[expression]) tags[expression] = [];
  if (!tags[expression].includes(tag)) {
    tags[expression].push(tag);
    saveTags(tags);
  }
  return true;
}

function removeTag(expression, tag) {
  const tags = loadTags();
  if (!tags[expression]) return false;
  tags[expression] = tags[expression].filter(t => t !== tag);
  if (tags[expression].length === 0) delete tags[expression];
  saveTags(tags);
  return true;
}

function getTagsForExpression(expression) {
  const tags = loadTags();
  return tags[expression] || [];
}

function getExpressionsByTag(tag) {
  const tags = loadTags();
  return Object.entries(tags)
    .filter(([, tagList]) => tagList.includes(tag))
    .map(([expr]) => expr);
}

function listAllTags() {
  const tags = loadTags();
  const all = new Set();
  Object.values(tags).forEach(list => list.forEach(t => all.add(t)));
  return Array.from(all).sort();
}

module.exports = { loadTags, saveTags, addTag, removeTag, getTagsForExpression, getExpressionsByTag, listAllTags };
