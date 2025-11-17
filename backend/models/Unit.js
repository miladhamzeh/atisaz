// models/Unit.js
const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // اسم اصلی در دیتابیس
  squareMeters: Number,
  building: String,
  floor: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Alias: residents <-> occupants
UnitSchema.virtual('residents')
  .get(function () { return this.occupants; })
  .set(function (v) { this.occupants = v; });

// Virtual balance (as before)
UnitSchema.virtual('balance').get(function() {
  return this._balance;
});

module.exports = mongoose.model('Unit', UnitSchema);
