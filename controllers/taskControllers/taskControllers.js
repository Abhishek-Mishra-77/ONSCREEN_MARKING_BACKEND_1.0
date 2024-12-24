import fs from "fs";
import path from "path";
import Task from "../../models/taskModels/taskModel.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";
import User from "../../models/authModels/User.js";
import SubjectSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import AnswerPdf from "../../models/taskModels/studentAnswerPdf.js";
import Schema from "../../models/schemeModel/schema.js";
import QuestionDefinition from "../../models/schemeModel/questionDefinitionSchema.js";
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { PDFDocument } from 'pdf-lib';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootFolder = path.join(__dirname, '..', '..', process.env.BASE_DIR);

const assigningTask = async (req, res) => {
    const { userId, subjectSchemaRelationId, folderPath, status, taskName, className, subjectCode } = req.body;

    // Start a session
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Validate inputs
        if (!userId || !subjectSchemaRelationId || !folderPath || !taskName || !className || !subjectCode) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        if (!isValidObjectId(subjectSchemaRelationId)) {
            return res.status(400).json({ message: "Invalid subjectSchemaRelationId." });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isExistTask = await Task.findOne({ userId });
        if (isExistTask) {
            return res.status(400).json({ message: "Task already exist" });
        }


        // Check if subject schema relation exists
        const subjectSchemaRelationDetails = await SubjectSchemaRelation.findById(subjectSchemaRelationId);
        if (!subjectSchemaRelationDetails) {
            return res.status(404).json({ message: "SubjectSchemaRelation not found" });
        }

        // Resolve and validate folder path
        const absoluteFolderPath = path.resolve(rootFolder, '..', folderPath);

        // Check if the folder exists
        if (!fs.existsSync(absoluteFolderPath)) {
            console.error("Folder does not exist:", absoluteFolderPath);
            return res.status(400).json({ message: "Folder does not exist or is inaccessible." });
        }

        // Asynchronously read the folder and get PDF filenames
        let pdfFileNames = [];
        try {
            const files = await fs.promises.readdir(absoluteFolderPath);
            const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
            pdfFileNames = pdfFiles;
        } catch (error) {
            console.error("Error reading folder contents:", error);
            return res.status(400).json({ message: "Unable to read folder contents." });
        }

        if (pdfFileNames.length === 0) {
            return res.status(400).json({ message: "No PDF files found in the folder." });
        }

        // Create and save the new task with the file count
        const newTask = new Task({
            userId,
            subjectSchemaRelationId,
            folderPath,
            totalFiles: pdfFileNames.length,
            status,
            taskName,
            className,
            subjectCode,
            currentFileIndex: 1
        });

        const savedTask = await newTask.save({ session });

        // Array to hold metadata for the PDF files
        const pdfMetadata = [];

        // Loop through each PDF file to extract metadata and save AnswerPdf documents
        for (const fileName of pdfFileNames) {
            const pdfPath = path.join(absoluteFolderPath, fileName);

            try {
                // Load the PDF to get metadata (like number of pages)
                const pdfBytes = await fs.promises.readFile(pdfPath);
                const pdfDoc = await PDFDocument.load(pdfBytes);

                // Get the number of pages (for simplicity, we assume images per page)
                const numberOfPages = pdfDoc.getPages().length;

                // Estimate total images based on pages (customize this logic based on your assumption)
                const totalImages = numberOfPages * 2; // Assume 2 images per page for example

                // Save the metadata into the AnswerPdf collection
                const answerPdf = new AnswerPdf({
                    taskId: savedTask._id,
                    totalImages: totalImages,
                    answerPdfName: fileName
                });

                // Save the AnswerPdf document to the database with session to ensure transactionality
                await answerPdf.save({ session });

                // Add metadata to response array
                pdfMetadata.push({
                    pdfName: fileName,
                    totalImages: totalImages
                });

            } catch (error) {
                console.error(`Error processing PDF: ${fileName}`, error);
            }
        }

        // Commit the transaction
        await session.commitTransaction();

        // Respond with the PDF names and image metadata
        res.status(200).json({ message: "Task assigned successfully" });
    } catch (error) {
        await session.abortTransaction();
        console.error("Error assigning task:", error);
        res.status(500).json({ message: "Failed to assign task", error: error.message });
    } finally {
        // End the session
        session.endSession();
    }
};


const updateAssignedTask = async (req, res) => {
    const { userId, subjectSchemaRelationId, folderPath, status, taskName, className, subjectCode } = req.body;
    const { id } = req.params;
    // Start a session
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Validate inputs
        if (!userId || !subjectSchemaRelationId || !folderPath || !taskName || !className || !subjectCode) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        if (!isValidObjectId(subjectSchemaRelationId)) {
            return res.status(400).json({ message: "Invalid subjectSchemaRelationId." });
        }

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid task ID." });
        }

        // Check if task exists
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if subject schema relation exists
        const subjectSchemaRelationDetails = await SubjectSchemaRelation.findById(subjectSchemaRelationId);
        if (!subjectSchemaRelationDetails) {
            return res.status(404).json({ message: "SubjectSchemaRelation not found" });
        }

        // Resolve and validate folder path
        const absoluteFolderPath = path.resolve(rootFolder, '..', folderPath);

        // Check if the folder exists
        if (!fs.existsSync(absoluteFolderPath)) {
            console.error("Folder does not exist:", absoluteFolderPath);
            return res.status(400).json({ message: "Folder does not exist or is inaccessible." });
        }

        // Asynchronously read the folder and get PDF filenames
        let pdfFileNames = [];
        try {
            const files = await fs.promises.readdir(absoluteFolderPath);
            const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
            pdfFileNames = pdfFiles;
        } catch (error) {
            console.error("Error reading folder contents:", error);
            return res.status(400).json({ message: "Unable to read folder contents." });
        }

        if (pdfFileNames.length === 0) {
            return res.status(400).json({ message: "No PDF files found in the folder." });
        }

        // Update the existing task
        existingTask.status = status || existingTask.status;
        existingTask.taskName = taskName || existingTask.taskName;
        existingTask.className = className || existingTask.className;
        existingTask.subjectCode = subjectCode || existingTask.subjectCode;
        existingTask.folderPath = folderPath || existingTask.folderPath;

        // Save the updated task with the session
        await existingTask.save({ session });

        // Remove existing AnswerPdf documents for this task (optional, if you want to update all documents)
        await AnswerPdf.deleteMany({ taskId: existingTask._id }, { session });

        // Array to hold metadata for the PDF files
        const pdfMetadata = [];

        // Loop through each PDF file to extract metadata and save AnswerPdf documents
        for (const fileName of pdfFileNames) {
            const pdfPath = path.join(absoluteFolderPath, fileName);

            try {
                // Load the PDF to get metadata (like number of pages)
                const pdfBytes = await fs.promises.readFile(pdfPath);
                const pdfDoc = await PDFDocument.load(pdfBytes);

                // Get the number of pages (for simplicity, we assume images per page)
                const numberOfPages = pdfDoc.getPages().length;

                // Estimate total images based on pages (customize this logic based on your assumption)
                const totalImages = numberOfPages * 2; // Assume 2 images per page for example

                // Save the metadata into the AnswerPdf collection
                const answerPdf = new AnswerPdf({
                    taskId: existingTask._id,
                    totalImages: totalImages,
                    answerPdfName: fileName
                });

                // Save the AnswerPdf document to the database with session to ensure transactionality
                await answerPdf.save({ session });

                // Add metadata to response array
                pdfMetadata.push({
                    pdfName: fileName,
                    totalImages: totalImages
                });

            } catch (error) {
                console.error(`Error processing PDF: ${fileName}`, error);
            }
        }

        // Commit the transaction
        await session.commitTransaction();

        // Respond with the updated PDF names and image metadata
        res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task", error: error.message });
    } finally {
        // End the session
        session.endSession();
    }
};

const removeAssignedTask = async (req, res) => {
    const { id } = req.params;

    try {
        // Validate task ID
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid task ID." });
        }

        // Start a session to handle the deletion as a transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find and delete the task
            const task = await Task.findByIdAndDelete(id, { session });
            if (!task) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Task not found" });
            }

            // Delete all related AnswerPdf documents
            await AnswerPdf.deleteMany({ taskId: id }, { session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ message: "Task and associated PDFs deleted successfully" });
        } catch (error) {
            // Rollback the transaction in case of an error
            await session.abortTransaction();
            session.endSession();
            console.error("Error during task and PDF deletion:", error);
            res.status(500).json({ message: "Failed to delete task and associated PDFs", error: error.message });
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Failed to delete task", error: error.message });
    }
};


const getAssignTaskById = async (req, res) => {
    const { id } = req.params;

    try {

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid task ID." });
        }

        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const subjectSchemaRelationDetails = await SubjectSchemaRelation.findById(task.subjectSchemaRelationId);

        if (!subjectSchemaRelationDetails) {
            return res.status(404).json({ message: "SubjectSchemaRelation not found" });
        }

        const schemaDetails = await Schema.findById(subjectSchemaRelationDetails.schemaId);

        if (!schemaDetails) {
            return res.status(404).json({ message: "Schema not found" });
        }

        const questionDefinitions = await QuestionDefinition.find({ schemaId: schemaDetails._id, parentQuestionId: null });

        if (!questionDefinitions) {
            return res.status(404).json({ message: "QuestionDefinitions not found" });
        }

        const taskDetails = {
            task: task,
            schemaDetails: schemaDetails,
            questionDefinitions: questionDefinitions
        }

        res.status(200).json({ taskDetails });
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: "Failed to fetch task", error: error.message });
    }
};

const getAllAssignedTaskByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }
        const tasks = await Task.find({ userId });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
    }
}

export {
    assigningTask,
    updateAssignedTask,
    removeAssignedTask,
    getAssignTaskById,
    getAllAssignedTaskByUserId
};

