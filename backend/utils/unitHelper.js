// utils/unitHelper.js
const Unit = require('../models/Unit');
const { normalizeObjectId } = require('./objectId');

/**
 * Ensures a user has a valid unit ObjectId. If missing, creates or reuses
 * a unit that matches the user's name (trimmed). Returns the ObjectId or null
 * without throwing cast errors.
 */
async function ensureUnitForUser(user) {
  if (!user) return null;

  // 1) Try to normalize any stored reference first
  const normalized = normalizeObjectId(user.unit);
  if (normalized) return normalized;

  // 2) Build a deterministic label from the user's name
  const label = (user.name || '').trim();
  if (!label) return null;

  // 3) Reuse existing unit by name or create a new one
  let unitDoc = await Unit.findOne({ number: label });
  if (!unitDoc) {
    unitDoc = await Unit.create({ number: label, owner: user._id, occupants: [user._id] });
  } else if (!unitDoc.occupants.some((x) => x.toString() === user._id.toString())) {
    unitDoc.occupants.push(user._id);
    await unitDoc.save();
  }

  // 4) Persist the reference on the user if needed
  if (!normalizeObjectId(user.unit)) {
    user.unit = unitDoc._id;
    await user.save();
  }

  return unitDoc._id;
}

module.exports = { ensureUnitForUser };
