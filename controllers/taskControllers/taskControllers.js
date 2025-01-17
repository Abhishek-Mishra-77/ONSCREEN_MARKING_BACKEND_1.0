import fs from "fs";
import path from "path";
import Task from "../../models/taskModels/taskModel.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";
import User from "../../models/authModels/User.js";
import SubjectSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import AnswerPdf from "../../models/EvaluationModels/studentAnswerPdf.js";
import Schema from "../../models/schemeModel/schema.js";
import QuestionDefinition from "../../models/schemeModel/questionDefinitionSchema.js";
import mongoose from 'mongoose';
import { PDFDocument } from 'pdf-lib';
import extractImagesFromPdf from "./extractImagesFromPDF.js";
import AnswerPdfImage from "../../models/EvaluationModels/answerPdfImageModel.js";
import Marks from "../../models/EvaluationModels/marksModel.js";
import { __dirname } from "../../server.js";


const assigningTask = async (req, res) => {
    const rootFolder = path.join(__dirname, '..', '..', process.env.BASE_DIR);
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

        const isExistTask = await Task.findOne({ subjectSchemaRelationId });
        if (isExistTask) {
            return res.status(400).json({ message: "Task already exist" });
        }


        // Check if subject schema relation exists
        const subjectSchemaRelationDetails = await SubjectSchemaRelation.findById(subjectSchemaRelationId);
        if (!subjectSchemaRelationDetails) {
            return res.status(404).json({ message: "SubjectSchemaRelation not found" });
        }

        const taskDetails = await Task.findOne({ folderPath: folderPath });

        if (taskDetails) {
            return res.status(400).json({ message: "Task already exist on this folder" });
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

                // Save the metadata into the AnswerPdf collection
                const answerPdf = new AnswerPdf({
                    taskId: savedTask._id,
                    totalImages: numberOfPages,
                    answerPdfName: fileName
                });

                // Save the AnswerPdf document to the database with session to ensure transactionality
                await answerPdf.save({ session });

                // Add metadata to response array
                pdfMetadata.push({
                    pdfName: fileName,
                    totalImages: numberOfPages
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
    const { userId, subjectSchemaRelationId, status, folderPath, taskName, className, subjectCode, currentFileIndex } = req.body;
    const { id } = req.params;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Validate inputs
        if (!userId || !subjectSchemaRelationId || !taskName || !className || !subjectCode || !currentFileIndex) {
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
        existingTask.folderPath = existingTask.folderPath;
        existingTask.currentFileIndex = currentFileIndex || existingTask.currentFileIndex;

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

        // Retrieve related details
        const subjectSchemaRelationDetails = await SubjectSchemaRelation.findById(task.subjectSchemaRelationId);
        if (!subjectSchemaRelationDetails) {
            return res.status(404).json({ message: "SubjectSchemaRelation not found" });
        }

        const schemaDetails = await Schema.findById(subjectSchemaRelationDetails.schemaId);
        if (!schemaDetails) {
            return res.status(404).json({ message: "Schema not found" });
        }

        const { folderPath, currentFileIndex, totalFiles } = task;

        // Validate currentFileIndex
        if (currentFileIndex < 1 || currentFileIndex > totalFiles) {
            return res.status(400).json({ message: "Invalid current file index." });
        }

        const pdfFolderPath = path.resolve(folderPath);
        const pdfFiles = fs.readdirSync(pdfFolderPath).filter(file => file.endsWith(".pdf"));

        // Ensure currentFileIndex is within the range of available PDFs
        if (currentFileIndex > pdfFiles.length) {
            return res.status(404).json({ message: "PDF file not found for the current index." });
        }

        const currentPdf = pdfFiles[currentFileIndex - 1];
        const extractedFolderPath = path.join(pdfFolderPath, "extractedPdfImages");
        const extractedPdfFolder = path.join(extractedFolderPath, path.basename(currentPdf, ".pdf"));

        let allImages = [];
        // If extracted folder doesn't exist, create it and extract images from the PDF
        if (!fs.existsSync(extractedPdfFolder)) {
            fs.mkdirSync(extractedPdfFolder, { recursive: true });
            const pdfPath = path.join(pdfFolderPath, currentPdf);
            allImages = await extractImagesFromPdf(pdfPath, extractedPdfFolder);

            // Save the extraction details in the AnswerPdf model
            const existingAnswerPdf = await AnswerPdf.findOne({ taskId: task._id, answerPdfName: currentPdf });
            let answerPdfDetails;

            if (!existingAnswerPdf) {
                answerPdfDetails = await AnswerPdf.create({
                    taskId: task._id,
                    totalImages: allImages.length,
                    answerPdfName: currentPdf,
                });
            } else {
                answerPdfDetails = existingAnswerPdf;
            }

            // Save the images to the AnswerPdfImage collection
            // Ensure we do not duplicate entries by checking if the image already exists
            for (let imageName of allImages) {
                const existingImage = await AnswerPdfImage.findOne({ answerPdfId: answerPdfDetails._id, name: imageName });
                if (!existingImage) {
                    await AnswerPdfImage.create({
                        answerPdfId: answerPdfDetails._id,
                        name: imageName,
                        status: "notVisited",
                    });
                }
            }
        }

        // Dynamically generate the path to the extracted images folder based on task.folderPath
        const extractedImagesFolder = path.join(task.folderPath, "extractedPdfImages", path.basename(currentPdf, ".pdf"));

        // Retrieve the current AnswerPdf details and associated images
        const answerPdfDetails = await AnswerPdf.findOne({ taskId: task._id, answerPdfName: currentPdf });
        const answerPdfImages = await AnswerPdfImage.find({ answerPdfId: answerPdfDetails._id });

        // Respond with the updated task details, images, and folder path
        res.status(200).json({
            task,
            extractedImagesFolder: extractedImagesFolder,
            answerPdfDetails,
            answerPdfImages,
            schemaDetails,
        });
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: "Failed to process task", error: error.message });
    }
};


const getAllTaskHandler = async (req, res) => {
    try {
        const tasks = await Task.find().populate('userId', 'name email');
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
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

const updateCurrentIndex = async (req, res) => {
    const { id } = req.params;
    const { currentIndex } = req.body;

    try {

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid task ID." });
        }

        if (!currentIndex) {
            return res.status(400).json({ message: "Invalid current index." });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }


        // Ensure currentIndex is a valid number and within the range of totalFiles
        if (currentIndex < 1 || currentIndex > task.totalFiles) {
            return res.status(400).json({ message: `currentIndex should be between 1 and ${task.totalFiles}` });
        }

        // Update currentFileIndex
        task.currentFileIndex = currentIndex;
        await task.save();

        res.status(200).json(task);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task", error: error.message });
    }
};

const getQuestionDefinitionTaskId = async (req, res) => {
    const { answerPdfId, taskId } = req.query;

    try {
        // Validate IDs
        if (!isValidObjectId(taskId)) {
            return res.status(400).json({ message: "Invalid task ID." });
        }

        if (!isValidObjectId(answerPdfId)) {
            return res.status(400).json({ message: "Invalid answerPdfId." });
        }

        // Retrieve the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Retrieve the related SubjectSchemaRelation and Schema
        const subjectSchemaRelationDetails = await SubjectSchemaRelation.findById(task.subjectSchemaRelationId);
        if (!subjectSchemaRelationDetails) {
            return res.status(404).json({ message: "SubjectSchemaRelation not found" });
        }

        const schemaDetails = await Schema.findById(subjectSchemaRelationDetails.schemaId);
        if (!schemaDetails) {
            return res.status(404).json({ message: "Schema not found" });
        }

        // Fetch all QuestionDefinitions for the schema
        const questionDefinitions = await QuestionDefinition.find({ schemaId: subjectSchemaRelationDetails.schemaId });
        if (!questionDefinitions || questionDefinitions.length === 0) {
            return res.status(404).json({ message: "No QuestionDefinitions found" });
        }

        // Fetch Marks data based on the provided answerPdfId and questionDefinitionId
        const marksData = await Marks.find({ answerPdfId: answerPdfId });

        // Add marks related data to the question definitions
        const enrichedQuestionDefinitions = await Promise.all(
            questionDefinitions.map(async (question) => {
                // Find the related Marks entry for the current questionDefinitionId
                const marks = marksData.find(m => m.questionDefinitionId.toString() === question._id.toString());

                // If Marks entry exists, add its data, otherwise leave as empty
                const marksInfo = marks ? {
                    allottedMarks: marks.allottedMarks,
                    answerPdfId: marks.answerPdfId,
                    timerStamps: marks.timerStamps,
                    isMarked: marks.isMarked
                } : {
                    allottedMarks: 0,
                    answerPdfId: answerPdfId,
                    timerStamps: "",
                    isMarked: false
                };

                // Return the enriched question with Marks data
                return {
                    ...question.toObject(),
                    ...marksInfo
                };
            })
        );

        // Send the enriched data as a response
        res.status(200).json(enrichedQuestionDefinitions);

    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
    }
};

export {
    assigningTask,
    updateAssignedTask,
    removeAssignedTask,
    getAssignTaskById,
    getAllAssignedTaskByUserId,
    getAllTaskHandler,
    updateCurrentIndex,
    getQuestionDefinitionTaskId
};

