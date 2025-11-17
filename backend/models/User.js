// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, index: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'secretary', 'accountant', 'lobbyman', 'security', 'facilities', 'user'],
    default: 'user'
  },
  roleLabel: { type: String },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  phone: String,
  address: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
