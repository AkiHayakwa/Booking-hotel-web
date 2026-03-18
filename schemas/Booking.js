const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotel",
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "room",
      required: true
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"]
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"]
    },
    numberOfGuests: {
      type: Number,
      required: true,
      min: [1, "Number of guests must be at least 1"]
    },
    totalPrice: {
      type: Number,
      required: true
    },
    promotion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "promotion",
      default: null
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
      default: 'pending'
    },
    specialRequests: {
      type: String,
      default: ""
    },
    bookingCode: {
      type: String,
      unique: true
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

module.exports = mongoose.model("booking", bookingSchema);
