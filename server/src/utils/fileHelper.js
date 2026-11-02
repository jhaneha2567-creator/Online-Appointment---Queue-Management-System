const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

/**
 * Read a JSON data file
 * @param {string} filename - name of the JSON file (e.g. 'users.json')
 * @returns {Array|Object} parsed JSON data
 */
function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    // Return empty array if file is missing or corrupt
    console.error(`Error reading ${filename}:`, err.message);
    return Array.isArray([]) ? [] : {};
  }
}

/**
 * Write data to a JSON file (overwrites)
 * @param {string} filename
 * @param {Array|Object} data
 */
function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
    throw err;
  }
}

/**
 * Add a new record to a JSON array file
 * @param {string} filename
 * @param {Object} record
 * @returns {Object} the added record
 */
function addRecord(filename, record) {
  const data = readJSON(filename);
  data.push(record);
  writeJSON(filename, data);
  return record;
}

/**
 * Update a record by id field
 * @param {string} filename
 * @param {string|number} id
 * @param {Object} updates
 * @param {string} idField - field to match (default: 'id')
 * @returns {Object|null} updated record or null
 */
function updateRecord(filename, id, updates, idField = 'id') {
  const data = readJSON(filename);
  const idx = data.findIndex((r) => r[idField] === id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...updates };
  writeJSON(filename, data);
  return data[idx];
}

/**
 * Delete a record by id
 * @param {string} filename
 * @param {string|number} id
 * @param {string} idField
 * @returns {boolean} true if deleted, false if not found
 */
function deleteRecord(filename, id, idField = 'id') {
  const data = readJSON(filename);
  const idx = data.findIndex((r) => r[idField] === id);
  if (idx === -1) return false;
  data.splice(idx, 1);
  writeJSON(filename, data);
  return true;
}

/**
 * Find a single record
 * @param {string} filename
 * @param {Function} predicate
 * @returns {Object|null}
 */
function findRecord(filename, predicate) {
  const data = readJSON(filename);
  return data.find(predicate) || null;
}

/**
 * Find multiple records matching a predicate
 * @param {string} filename
 * @param {Function} predicate
 * @returns {Array}
 */
function findRecords(filename, predicate) {
  const data = readJSON(filename);
  return data.filter(predicate);
}

module.exports = {
  readJSON,
  writeJSON,
  addRecord,
  updateRecord,
  deleteRecord,
  findRecord,
  findRecords,
};
