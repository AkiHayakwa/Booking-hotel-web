// === Schema: Room ===
var mongoose = require('mongoose');

var roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  roomType: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
  floor: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
