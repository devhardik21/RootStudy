
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve("uploads"))
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage,
    limits: {
        fieldSize: 25 * 1024 * 1024,  // allow 25MB for text fields
        fileSize: 20 * 1024 * 1024    // allow 20MB files
    } 
 });
export { upload };