
import multer from 'multer';
import fs from 'fs';
import path from 'path';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/temp');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

const uploadMiddleware = upload.fields([
    { name: 'questionPdf', maxCount: 1 },
    { name: 'answerPdf', maxCount: 1 }
]);

export default uploadMiddleware;
