// === Schema: BlogComment ===
var mongoose = require('mongoose');

var blogCommentSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment', default: null },
  isEdited: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('BlogComment', blogCommentSchema);
