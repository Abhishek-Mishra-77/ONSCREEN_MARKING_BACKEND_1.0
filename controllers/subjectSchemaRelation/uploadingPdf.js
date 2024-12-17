import multer from 'multer';
import fs from 'fs';
import path from 'path';



/* -------------------------------------------------------------------------- */
/*                                  UPLOAD PDF                                */
/* -------------------------------------------------------------------------- */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.resolve(process.cwd(), 'uploadedPdfs/temp');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

export const uploadMiddleware = upload.fields([
    { name: 'questionPdf', maxCount: 1 },
    { name: 'answerPdf', maxCount: 1 }
]);

export default uploadMiddleware;