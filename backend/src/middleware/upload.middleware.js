import multer from "multer";

const storage = multer.memoryStorage();

// File size limits
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const MAX_VIDEO_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/avif",
  ];

  const allowedVideoTypes = [
    "video/mp4",
    "video/avi",
    "video/mov",
    "video/wmv",
    "video/flv",
    "video/webm",
    "video/mkv",
  ];

  const allowedPdfTypes = ["application/pdf"];

  const allAllowedTypes = [
    ...allowedImageTypes,
    ...allowedVideoTypes,
    ...allowedPdfTypes,
  ];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, videos, and PDFs are allowed."
      ),
      false
    );
  }
};

// Custom file size validation middleware for multiple files
export const validateFileSize = (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);

  if (files.length === 0) {
    return next();
  }

  for (const file of files) {
    const fileSize = file.size;

    // Check PDF size limit
    if (file.mimetype === "application/pdf") {
      if (fileSize > MAX_PDF_SIZE) {
        return res.status(400).json({
          error: "File too large",
          message: `PDF file "${file.originalname}" must be smaller than 10MB`,
        });
      }
    }

    // For videos, we'll need to check duration after upload
    // This is a basic size check - for accurate duration checking,
    // you might want to use a library like ffprobe
    if (file.mimetype.startsWith("video/")) {
      // Basic size check - assuming average bitrate, 3 minutes of video
      // could be around 50-100MB depending on quality
      const estimatedMaxVideoSize = 100 * 1024 * 1024; // 100MB rough estimate
      if (fileSize > estimatedMaxVideoSize) {
        return res.status(400).json({
          error: "File too large",
          message: `Video file "${file.originalname}" appears to be longer than 3 minutes or too large`,
        });
      }
    }
  }

  next();
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max per file
    files: 10, // Maximum 10 files per upload
  },
});
