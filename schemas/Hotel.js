const mongoose = require("mongoose");
const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hotel name is required"]
    },
    description: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      required: [true, "Address is required"]
    },
    city: {
      type: String,
      required: [true, "City is required"]
    },
    images: [{
      type: String
    }],
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      match: [/^\d{10,11}$/, "Số điện thoại không hợp lệ (10-11 số)"]
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Email không hợp lệ"]
    },
    starRating: {
      type: Number,
      required: [true, "Xếp hạng sao là bắt buộc"],
      min: [1, "Xếp hạng thấp nhất là 1 sao"],
      max: [5, "Xếp hạng cao nhất là 5 sao"],
      default: 3
    },
    amenities: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "amenity"
    }],
    rating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    isApproved: {
      type: Boolean,
      default: false
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

module.exports = mongoose.model("hotel", hotelSchema);
