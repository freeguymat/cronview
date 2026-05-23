const TEMPLATES = [
  { name: 'Every minute', expression: '* * * * *', category: 'frequent' },
  { name: 'Every 5 minutes', expression: '*/5 * * * *', category: 'frequent' },
  { name: 'Every 15 minutes', expression: '*/15 * * * *', category: 'frequent' },
  { name: 'Every 30 minutes', expression: '*/30 * * * *', category: 'frequent' },
  { name: 'Every hour', expression: '0 * * * *', category: 'hourly' },
  { name: 'Every 6 hours', expression: '0 */6 * * *', category: 'hourly' },
  { name: 'Every 12 hours', expression: '0 */12 * * *', category: 'hourly' },
  { name: 'Daily at midnight', expression: '0 0 * * *', category: 'daily' },
  { name: 'Daily at noon', expression: '0 12 * * *', category: 'daily' },
  { name: 'Weekdays at 9am', expression: '0 9 * * 1-5', category: 'weekly' },
  { name: 'Every Monday', expression: '0 0 * * 1', category: 'weekly' },
  { name: 'Weekly on Sunday', expression: '0 0 * * 0', category: 'weekly' },
  { name: 'First of month', expression: '0 0 1 * *', category: 'monthly' },
  { name: 'Last day of month', expression: '0 0 28-31 * *', category: 'monthly' },
  { name: 'Quarterly', expression: '0 0 1 */3 *', category: 'monthly' },
  { name: 'Yearly on Jan 1', expression: '0 0 1 1 *', category: 'yearly' },
];

function listTemplates() {
  return [...TEMPLATES];
}

function getTemplatesByCategory(category) {
  return TEMPLATES.filter(t => t.category === category);
}

function findTemplate(name) {
  return TEMPLATES.find(t => t.name.toLowerCase() === name.toLowerCase()) || null;
}

function listCategories() {
  return [...new Set(TEMPLATES.map(t => t.category))];
}

function searchTemplates(query) {
  const q = query.toLowerCase();
  return TEMPLATES.filter(
    t => t.name.toLowerCase().includes(q) || t.expression.includes(q)
  );
}

module.exports = {
  listTemplates,
  getTemplatesByCategory,
  findTemplate,
  listCategories,
  searchTemplates,
};
