import SubjectSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import Subject from "../../models/classModel/subjectModel.js";
import Schema from "../../models/schemeModel/schema.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";
import fs from 'fs';
import path from 'path';
import extractImagesFromPdf from "./extractingPdfImages.js";


const createSubjectSchemaRelation = async (req, res) => {
    try {
        const { schemaId, subjectId } = req.body;

        if (!schemaId || !subjectId || !req.files.questionPdf || !req.files.answerPdf) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (!isValidObjectId(subjectId) || !isValidObjectId(schemaId)) {
            return res.status(400).json({ message: "Invalid subjectId or schemaId." });
        }

        const isValidSubject = await Subject.findOne({ _id: subjectId });
        if (!isValidSubject) {
            return res.status(404).json({ message: "Subject not found." });
        }

        const isValidSchema = await Schema.findOne({ _id: schemaId });
        if (!isValidSchema) {
            return res.status(404).json({ message: "Schema not found." });
        }

        // Define base directories
        const baseDir = path.resolve(process.cwd(), 'uploadedPdfs');
        const questionPdfDir = path.join(baseDir, 'questionPdfs');
        const answerPdfDir = path.join(baseDir, 'answerPdfs');
        const extractedQuestionImageDir = path.join(baseDir, 'extractedQuestionPdfImages');
        const extractedAnswerImageDir = path.join(baseDir, 'extractedAnswerPdfImages');

        // Ensure base directories exist
        [questionPdfDir, answerPdfDir, extractedQuestionImageDir, extractedAnswerImageDir].forEach(dir => {
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

        // Extract images from PDFs into dynamically named directories
        const questionImageSubDir = path.join(extractedQuestionImageDir, `${path.basename(questionPdf.filename, '.pdf')}`);
        const answerImageSubDir = path.join(extractedAnswerImageDir, `${path.basename(answerPdf.filename, '.pdf')}`);

        if (!fs.existsSync(questionImageSubDir)) fs.mkdirSync(questionImageSubDir, { recursive: true });
        if (!fs.existsSync(answerImageSubDir)) fs.mkdirSync(answerImageSubDir, { recursive: true });

        const questionImageCount = await extractImagesFromPdf(questionPdfPath, questionImageSubDir);
        const answerImageCount = await extractImagesFromPdf(answerPdfPath, answerImageSubDir);

        // Save the new SubjectSchemaRelation
        const newSubjectSchemaRelation = new SubjectSchemaRelation({
            schemaId,
            subjectId,
            questionPdfPath: `${path.basename(questionPdf.filename, '.pdf')}`,
            answerPdfPath: `${path.basename(answerPdf.filename, '.pdf')}`,
            countOfQuestionImages: questionImageCount,
            countOfAnswerImages: answerImageCount,
        });

        const savedSubjectSchemaRelation = await newSubjectSchemaRelation.save();

        res.status(201).json(savedSubjectSchemaRelation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the subject schema relation.' });
    }
};

const getSubjectSchemaRelationById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subject schema relation ID." });
        }

        const subjectSchemaRelation = await SubjectSchemaRelation.findById({ _id: id });

        if (!subjectSchemaRelation) {
            return res.status(404).json({ message: "Subject schema relation not found." });
        }

        res.status(200).json(subjectSchemaRelation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the subject schema relation.' });
    }
}

const deleteSubjectSchemaRelationById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subject schema relation ID." });
        }


        // Find the SubjectSchemaRelation before deletion
        const subjectSchemaRelation = await SubjectSchemaRelation.findById({ _id: id });
        if (!subjectSchemaRelation) {
            return res.status(404).json({ message: "Subject schema relation not found." });
        }

        // Define base directories
        const baseDir = path.resolve(process.cwd(), 'uploadedPdfs');
        const questionPdfPath = path.join(baseDir, 'questionPdfs', `${subjectSchemaRelation.questionPdfPath}.pdf`);
        const answerPdfPath = path.join(baseDir, 'answerPdfs', `${subjectSchemaRelation.answerPdfPath}.pdf`);
        const extractedQuestionImageDir = path.join(baseDir, 'extractedQuestionPdfImages', subjectSchemaRelation.questionPdfPath);
        const extractedAnswerImageDir = path.join(baseDir, 'extractedAnswerPdfImages', subjectSchemaRelation.answerPdfPath);

        // Helper function to remove files or directories
        const removeFileOrDirectory = (filePath) => {
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filePath);
                }
            }
        };

        // Remove PDF files and extracted image directories
        removeFileOrDirectory(questionPdfPath);
        removeFileOrDirectory(answerPdfPath);
        removeFileOrDirectory(extractedQuestionImageDir);
        removeFileOrDirectory(extractedAnswerImageDir);

        // Delete the SubjectSchemaRelation from the database
        await SubjectSchemaRelation.findByIdAndDelete(id);

        res.status(200).json({ message: "Subject schema relation and associated files deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the subject schema relation.' });
    }
};

const updateSubjectSchemaRelation = async (req, res) => {

}

const getAllSubjectSchemaRelationBySubjectId = async (req, res) => {
    const { subjectId } = req.params;
    try {

        if (!isValidObjectId(subjectId)) {
            return res.status(400).json({ message: "Invalid subject ID." });
        }

        const subjectSchemaRelations = await SubjectSchemaRelation.find({ subjectId: subjectId });
        if (!subjectSchemaRelations) {
            return res.status(404).json({ message: "Subject schema relations not found." });
        }

        res.status(200).json(subjectSchemaRelations);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the subject schema relations.' });
    }
}

const getAllSubjectSchemaRelationBySchemaId = async (req, res) => {
    const { schemaId } = req.params;

    try {

        if (!isValidObjectId(schemaId)) {
            return res.status(400).json({ message: "Invalid schema ID." });
        }

        const subjectSchemaRelations = await SubjectSchemaRelation.find({ schemaId: schemaId });
        if (!subjectSchemaRelations) {
            return res.status(404).json({ message: "Subject schema relations not found." });
        }

        res.status(200).json(subjectSchemaRelations);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the subject schema relations.' });
    }
}


const getAllSubjectSchemaRelationBySchemaIdAndSubjectId = async (req, res) => {
    const { schemaId, subjectId } = req.params;

    try {

    }
    catch (error) {

    }

}

export {
    createSubjectSchemaRelation,
    getSubjectSchemaRelationById,
    deleteSubjectSchemaRelationById,
    updateSubjectSchemaRelation,
    getAllSubjectSchemaRelationBySubjectId,
    getAllSubjectSchemaRelationBySchemaId
}
