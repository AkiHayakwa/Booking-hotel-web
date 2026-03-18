const mongoose = require("mongoose");
const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Promotion title is required"]
    },
    description: {
      type: String,
      default: ""
    },
    thumbnail: {
      type: String,
      default: ""
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotel",
      required: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    minNights: {
      type: Number,
      default: 1
    },
    applicableRoomTypes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "roomType"
    }],
    promoCode: {
      type: String,
      unique: true,
      sparse: true
    },
    maxUsage: {
      type: Number
    },
    usedCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("promotion", promotionSchema);
