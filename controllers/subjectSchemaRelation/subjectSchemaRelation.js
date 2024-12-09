import SubjectSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import Subject from "../../models/classModel/subjectModel.js";
import Schema from "../../models/schemeModel/schema.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import multer from "multer";

// Define storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.resolve(process.cwd(), 'uploadedPdfs/temp');

        // Check if the directory exists, if not, create it
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Set the upload path
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename with timestamp and original name
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

// Create an upload middleware using Multer
const upload = multer({ storage });

export const uploadMiddleware = upload.fields([
    { name: 'questionPdf', maxCount: 1 },
    { name: 'answerPdf', maxCount: 1 }
]);

// Function to extract images from a PDF
const extractImagesFromPdf = async (pdfPath, outputDir) => {
    // Read the PDF file
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    let imageCounter = 0;

    for (const page of pages) {
        const images = page.getImages();

        for (const image of images) {
            const outputImagePath = path.join(outputDir, `image${imageCounter}.png`);
            fs.writeFileSync(outputImagePath, image.bytes);
            imageCounter++;
        }
    }

    return imageCounter;
};

const createSubjectSchemaRelation = async (req, res) => {
    try {
        // Access JSON data from the request body
        const { schemaId, subjectId } = req.body;

        // Check if the required data is present
        if (!schemaId || !subjectId || !req.files.questionPdf || !req.files.answerPdf) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Validate ObjectId
        if (!isValidObjectId(subjectId) || !isValidObjectId(schemaId)) {
            return res.status(400).json({ message: "Invalid subjectId or schemaId." });
        }

        // Check if the subject and schema exist
        const isValidSubject = await Subject.findOne({ _id: subjectId });
        if (!isValidSubject) {
            return res.status(404).json({ message: "Subject not found." });
        }

        const isValidSchema = await Schema.findOne({ _id: schemaId });
        if (!isValidSchema) {
            return res.status(404).json({ message: "Schema not found." });
        }

        // Define output directories
        const baseDir = path.resolve(process.cwd(), 'uploadedPdfs');
        const questionPdfDir = path.join(baseDir, 'questionPdfs');
        const answerPdfDir = path.join(baseDir, 'answerPdfs');
        const questionImageDir = path.join(baseDir, 'extractedQuestionPdfImages');
        const answerImageDir = path.join(baseDir, 'extractedAnswerPdfImages');

        // Ensure directories exist
        [questionPdfDir, answerPdfDir, questionImageDir, answerImageDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Move and rename PDF files
        const questionPdf = req.files.questionPdf[0];
        const answerPdf = req.files.answerPdf[0];
        const questionPdfPath = path.join(questionPdfDir, questionPdf.filename);
        const answerPdfPath = path.join(answerPdfDir, answerPdf.filename);

        fs.renameSync(questionPdf.path, questionPdfPath);
        fs.renameSync(answerPdf.path, answerPdfPath);

        // Extract images from PDFs and count them
        const questionImageCount = await extractImagesFromPdf(questionPdfPath, questionImageDir);
        const answerImageCount = await extractImagesFromPdf(answerPdfPath, answerImageDir);

        // Create the new SubjectSchemaRelation
        const newSubjectSchemaRelation = new SubjectSchemaRelation({
            schemaId,
            subjectId,
            questionPdfPath,
            answerPdfPath,
            countOfQuestionImages: questionImageCount,
            countOfAnswerImages: answerImageCount
        });

        // Save to the database
        const savedSubjectSchemaRelation = await newSubjectSchemaRelation.save();

        // Respond with the saved relation
        res.status(201).json(savedSubjectSchemaRelation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the subject schema relation.' });
    }
};

const getSubjectSchemaRelationById = async (req, res) => { }

const deleteSubjectSchemaRelationById = async (req, res) => { }

const updateSubjectSchemaRelation = async (req, res) => { }

const getAllSubjectSchemaRelationBySubjectId = async (req, res) => { }

const getAllSubjectSchemaRelationBySchemaId = async (req, res) => { }

export {
    createSubjectSchemaRelation,
    getSubjectSchemaRelationById,
    deleteSubjectSchemaRelationById,
    updateSubjectSchemaRelation,
    getAllSubjectSchemaRelationBySubjectId,
    getAllSubjectSchemaRelationBySchemaId
}
