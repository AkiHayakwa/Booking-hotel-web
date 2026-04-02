var express = require('express');
var router = express.Router();
var uploadHandler = require('../utils/uploadHandler');

// POST /api/v1/upload
router.post('/', uploadHandler.single('image'), function (req, res, next) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file nào được tải lên.' });
  }

  // File is saved, return the public URL path
  // E.g., if saved as public/uploads/img-123.jpg, the URL path is /uploads/img-123.jpg
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'Tải ảnh lên thành công',
    url: fileUrl
  });
});

module.exports = router;
