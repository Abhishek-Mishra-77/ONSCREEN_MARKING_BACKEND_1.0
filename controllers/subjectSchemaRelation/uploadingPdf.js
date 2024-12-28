import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.resolve(process.cwd(), 'uploadedPdfs/temp');

        console.log("Upload directory:", uploadDir);

        fs.mkdir(uploadDir, { recursive: true }, (err) => {
            if (err) {
                console.error("Error creating directory:", err);
                return cb(err, null);
            }
            console.log("Directory created or already exists");
            cb(null, uploadDir);
        });
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

export const uploadMiddleware = (req, res, next) => {
    console.log("Upload Middleware triggered");

    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    upload.fields([
        { name: 'questionPdf', maxCount: 1 },
        { name: 'answerPdf', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            console.error("Error uploading files:", err);
            return res.status(400).json({ message: 'File upload failed', error: err.message });
        }

        console.log("File upload successful");
        next();
    });
};

export default uploadMiddleware;
