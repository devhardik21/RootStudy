import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.CLOUDINARY_API_KEY);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

export const UploadOnCloudinary = async (filePathOrBuffer) => {
    try {
        if (!filePathOrBuffer) {
            throw new Error("No file provided");
        }

        let uploadOptions = {
            resource_type: "auto",
            folder: "ai-generated-images"
        };

        // Check if it's a Buffer (binary data) or file path (string)
        if (Buffer.isBuffer(filePathOrBuffer)) {
            // Convert Buffer to base64 data URI
            const base64Image = `data:image/png;base64,${filePathOrBuffer.toString('base64')}`;

            const result = await cloudinary.uploader.upload(base64Image, uploadOptions);
            return result;
        } else {
            // It's a file path (your existing logic)
            const result = await cloudinary.uploader.upload(filePathOrBuffer, uploadOptions);
            return result;
        }

    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    }
};