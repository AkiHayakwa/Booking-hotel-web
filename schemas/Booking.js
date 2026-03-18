// === Schema: Booking ===
var mongoose = require('mongoose');

var bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  numberOfGuests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion', default: null },
  discountAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'], default: 'pending' },
  specialRequests: { type: String },
  bookingCode: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
