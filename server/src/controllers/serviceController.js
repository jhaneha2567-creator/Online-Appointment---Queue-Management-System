const { readJSON, addRecord, updateRecord, deleteRecord } = require('../utils/fileHelper');

const getServices = (req, res) => {
  const services = readJSON('services.json');
  res.json(services);
};

const getActiveServices = (req, res) => {
  const services = readJSON('services.json');
  res.json(services.filter((s) => s.active));
};

const createService = (req, res) => {
  const { name, duration, description, color } = req.body;
  if (!name || !duration) {
    return res.status(400).json({ error: 'Name and duration are required.' });
  }
  const services = readJSON('services.json');
  const existing = services.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'A service with this name already exists.' });
  }
  // Generate next service ID
  const ids = services.map((s) => parseInt(s.id.replace('SER', ''), 10)).filter((n) => !isNaN(n));
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  const newService = {
    id: `SER${String(maxId + 1).padStart(3, '0')}`,
    name,
    duration: parseInt(duration),
    description: description || '',
    active: true,
    color: color || '#3B82F6',
  };
  addRecord('services.json', newService);
  res.status(201).json(newService);
};

const updateService = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = updateRecord('services.json', id, updates);
  if (!updated) return res.status(404).json({ error: 'Service not found.' });
  res.json(updated);
};

const deleteService = (req, res) => {
  const { id } = req.params;
  const deleted = deleteRecord('services.json', id);
  if (!deleted) return res.status(404).json({ error: 'Service not found.' });
  res.json({ message: 'Service deleted successfully.' });
};

module.exports = { getServices, getActiveServices, createService, updateService, deleteService };
