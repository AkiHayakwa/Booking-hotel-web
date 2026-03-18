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
      default: ""
    },
    email: {
      type: String,
      default: ""
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
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
