import fs from "fs";

export const deleteTempFile = (path) => {
  fs.unlink(path, (err) => {
    if (err) console.error("Failed to delete temp file:", path);
  });
};
