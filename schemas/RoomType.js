// === Schema: RoomType ===
var mongoose = require('mongoose');

var roomTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  images: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('RoomType', roomTypeSchema);
