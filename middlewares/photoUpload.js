const path = require("path");
const multer = require("multer");

// Photo Storage
const photoStorage = multer.diskStorage({
  destination: function (req, file, cp) {
    cp(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cp) {
    if (file) {
      cp(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cp(null, false);
    }
  },
});

// photo Upload Middleware
const photoUpload = multer({
  storage: photoStorage,
  fileFilter: function (req, file, callback) {
    if (file.mimetype.startsWith("image")) {
      callback(null, true);
    } else {
      callback({ message: "Unsupported file foarmat" });
    }
  },
  limits: { fileSize: 1024 * 1024 }, // 1 megabyte
});

module.exports = photoUpload;
