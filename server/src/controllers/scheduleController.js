const { readJSON, writeJSON } = require('../utils/fileHelper');

const getSchedule = (req, res) => {
  const schedule = readJSON('schedule.json');
  res.json(schedule);
};

const updateSchedule = (req, res) => {
  const current = readJSON('schedule.json');
  const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };
  writeJSON('schedule.json', updated);
  res.json(updated);
};

module.exports = { getSchedule, updateSchedule };
