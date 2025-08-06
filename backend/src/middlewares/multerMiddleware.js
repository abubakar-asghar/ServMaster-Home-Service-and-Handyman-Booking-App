import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";

// Use absolute path and OS temp directory as fallback
const getUploadPath = () => {
  // Try project's public/temp first
  const projectTempPath = path.join(process.cwd(), "public", "temp");

  // Fallback to system temp directory if needed
  const systemTempPath = path.join(os.tmpdir(), "app-temp");

  // Create directory if it doesn't exist
  const ensureDirExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  };

  try {
    return ensureDirExists(projectTempPath);
  } catch (error) {
    console.warn(
      `Could not use project temp dir, falling back to system temp: ${error}`
    );
    return ensureDirExists(systemTempPath);
  }
};

const uploadPath = getUploadPath();

// Clean filename helper
const cleanFileName = (fileName) => {
  return fileName
    .replace(/[^a-zA-Z0-9-_.]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .toLowerCase(); // Convert to lowercase
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const cleanedName = cleanFileName(baseName);
    cb(null, `${Date.now()}-${cleanedName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Only ${allowedMimeTypes.join(", ")} are allowed!`
      ),
      false
    );
  }
};

// Configure multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum number of files
  },
});

// Cleanup function for temp files
export const cleanupTempFiles = () => {
  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      console.error("Error reading temp directory:", err);
      return;
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    files.forEach((file) => {
      if (file === ".gitkeep") return;

      const filePath = path.join(uploadPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error checking file ${file}:`, err);
          return;
        }

        // Delete files older than 1 hour
        if (now - stats.mtimeMs > oneHour) {
          fs.unlink(filePath, (err) => {
            if (err) console.error(`Error deleting ${file}:`, err);
            else console.log(`Cleaned up temp file: ${file}`);
          });
        }
      });
    });
  });
};

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

export default upload;
