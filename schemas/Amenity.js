// === Schema: Amenity ===
var mongoose = require('mongoose');

var amenitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Amenity', amenitySchema);
