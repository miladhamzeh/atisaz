// utils/objectId.js
const { isValidObjectId } = require('mongoose');

function normalizeObjectId(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') return isValidObjectId(raw) ? raw : null;
  if (typeof raw === 'object') {
    if (raw._id && isValidObjectId(raw._id)) return raw._id;
    if (raw.id && isValidObjectId(raw.id)) return raw.id;
  }
  return null;
}

module.exports = { normalizeObjectId, isValidObjectId };
