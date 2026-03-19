const mongoose = require("mongoose");
let slugify = require('slugify')
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"]
    },
    slug: {
      type: String,
      unique: true
    },
    content: {
      type: String,
      required: [true, "Blog content is required"]
    },
    thumbnail: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      enum: ['news', 'travel_tips', 'hotel_info', 'promotion', 'review'],
      default: 'news'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    tags: [{
      type: String
    }],
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    },
    commentCount: {
      type: Number,
      default: 0
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
blogSchema.pre('save', function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now()
  }
})

module.exports = mongoose.model("blog", blogSchema);
