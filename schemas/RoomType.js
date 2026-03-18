const mongoose = require("mongoose");
const roomTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room type name is required"]
    },
    description: {
      type: String,
      default: ""
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"]
    },
    maxGuests: {
      type: Number,
      required: [true, "Max guests is required"],
      min: [1, "Max guests must be at least 1"]
    },
    images: [{
      type: String
    }],
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotel",
      required: true
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

module.exports = mongoose.model("roomType", roomTypeSchema);
