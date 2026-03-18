const mongoose = require("mongoose");
const blogCommentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blog",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    content: {
      type: String,
      required: [true, "Comment content is required"]
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blogComment",
      default: null
    },
    isEdited: {
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

module.exports = mongoose.model("blogComment", blogCommentSchema);
