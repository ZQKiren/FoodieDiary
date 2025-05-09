const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Thay đổi từ diskStorage sang memoryStorage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter,
});

module.exports = upload;