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

const UploadOnCloudinary = async (LocalUrl) => {
    try {
        if (!LocalUrl) {
            console.log("No local url found");

            return null;
        }

        // uploading the file on cloudinary 
        const response = await cloudinary.uploader.upload(LocalUrl, {
            resource_type: "auto"
        })

        console.log('Uploaded on cloudinary successfully', response.url);

        // fs.unlinkSync(LocalUrl) ;
        return response.url;


    } catch (error) {
        console.log("directly to the catch block of the cloudinary");
        console.log(error);

        console.log("file will get deleted from the local");
        // fs.unlinkSync(LocalUrl);
    }

}

export { UploadOnCloudinary };