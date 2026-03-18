const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema(
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must be at most 5"]
    },
    comment: {
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

module.exports = mongoose.model("review", reviewSchema);
