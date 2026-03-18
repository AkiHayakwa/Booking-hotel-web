// === Schema: Blog ===
var mongoose = require('mongoose');

var blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true },
  thumbnail: { type: String },
  category: { type: String, enum: ['news', 'travel_tips', 'hotel_info', 'promotion'], default: 'news' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  commentCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
