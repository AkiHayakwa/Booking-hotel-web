// === Schema: Payment ===
var mongoose = require('mongoose');

var paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'credit_card', 'bank_transfer'], default: 'cash' },
  status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  paidAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
