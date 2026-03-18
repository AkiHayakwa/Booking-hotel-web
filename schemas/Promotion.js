// === Schema: Promotion ===
var mongoose = require('mongoose');

var promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  discountType: { type: String, enum: ['percentage', 'fixed_amount'], required: true },
  discountValue: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  minNights: { type: Number, default: 1 },
  applicableRoomTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoomType' }],
  promoCode: { type: String, unique: true, sparse: true },
  maxUsage: { type: Number },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
