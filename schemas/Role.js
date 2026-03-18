const mongoose = require("mongoose");
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      enum: ['admin', 'hotel_owner', 'customer']
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

module.exports = mongoose.model("role", roleSchema);
