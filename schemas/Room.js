const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"]
    },
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roomType",
      required: true
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hotel",
      required: true
    },
    floor: {
      type: Number,
      required: [true, "Floor is required"]
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available'
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

module.exports = mongoose.model("room", roomSchema);
