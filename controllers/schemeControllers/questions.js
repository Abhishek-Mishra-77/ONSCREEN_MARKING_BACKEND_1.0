import QuestionFile from "../../models/schemeModel/questionModel.js";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import pdfPoppler from 'pdf-poppler';

// Ensure the uploads directory exists
const ensureUploadsFolderExists = () => {
    const uploadDir = path.join('uploads');
    if (!fs.existsSync(uploadDir)) {
        console.log('Creating uploads directory...');
        fs.mkdirSync(uploadDir, { recursive: true });
    }
};

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureUploadsFolderExists(); // Ensure uploads folder exists before saving files
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
});

// Convert PDF pages to images
const convertPdfToImages = async (pdfPath, outputDir) => {
    const options = {
        format: 'png', // Output format
        out_dir: outputDir, // Output directory
        out_prefix: path.basename(pdfPath, path.extname(pdfPath)), // Prefix for image filenames
        page: null, // Null means convert all pages
    };

    try {
        // Ensure the output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Run pdf-poppler conversion
        await pdfPoppler.convert(pdfPath, options);

        // Get all image files created in the output directory
        const imageFiles = fs.readdirSync(outputDir).filter(file => file.endsWith('.png'));
        console.log('Images generated:', imageFiles);

        return imageFiles;
    } catch (error) {
        console.error('Error converting PDF to images:', error.message);
        throw new Error('Error converting PDF to images: ' + error.message);
    }
};

// Save Questions File Controller
const onSaveQuestionsFile = async (req, res) => {
    const { id } = req.params;

    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    try {
        const pdfPath = path.join('uploads', req.file.filename);
        const outputDir = path.join('uploads', req.file.filename.split('.')[0]);

        // Ensure the output directory exists
        if (!fs.existsSync(outputDir)) {
            console.log(`Creating output directory: ${outputDir}`);
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Convert the PDF to images
        const imageFiles = await convertPdfToImages(pdfPath, outputDir);

        // Save the file info and image paths to MongoDB
        const imagePaths = imageFiles.map(image => path.join(outputDir, image));

        const questionFile = new QuestionFile({
            fileName: req.file.filename,
            subjectId: id,
            images: imagePaths,
        });

        await questionFile.save();

        // Remove the original PDF file after processing
        fs.unlinkSync(pdfPath);

        res.status(201).json({
            message: 'File uploaded and processed successfully',
            questionFile,
        });
    } catch (error) {
        console.error('Error processing file:', error.message);

        // Clean up the uploaded file if processing fails
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ message: "Error processing the PDF file", error: error.message });
    }
};

// Middleware to handle file uploads with multer
const uploadQuestionsFile = upload.single('pdfFile');

export { onSaveQuestionsFile, uploadQuestionsFile };
