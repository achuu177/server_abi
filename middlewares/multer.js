const multer = require("multer");

// Config multer
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Export upload
const upload = multer({ storage: storage });

module.exports = { upload };
