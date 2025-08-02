import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// ✅ Load environment variables right here
dotenv.config({ path: "src/.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  localFilePath,
  folder = "servmaster"
) => {
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    console.log(response.secure_url);
    return response.secure_url;
  } catch (err) {
    console.log("Cloudinary Error:", err.message || err);
    throw new Error("Cloudinary upload failed");
  }
};
