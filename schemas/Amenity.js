const mongoose = require("mongoose");
const amenitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Amenity name is required"]
    },
    icon: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      enum: ['hotel', 'room', 'both'],
      default: 'both'
    },
    description: {
      type: String,
      default: ""
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

module.exports = mongoose.model("amenity", amenitySchema);
