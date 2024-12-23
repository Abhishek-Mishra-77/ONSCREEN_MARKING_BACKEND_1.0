import fs from "fs";
import path from "path";
import Task from "../../models/taskModels/taskModel.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";
import User from "../../models/authModels/User.js";
import subjectSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import AnswerPdf from "../../models/taskModels/studentAnswerPdf.js";
import { fileURLToPath } from 'url';
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootFolder = path.join(__dirname, '..', '..', process.env.BASE_DIR);

const assigningTask = async (req, res) => {
    const { userId, subjectSchemaRelationId, folderPath, status, taskName } = req.body;

    // Start a session
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Validate inputs
        if (!userId || !subjectSchemaRelationId || !folderPath || !taskName) {
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

        // Check if subject schema relation exists
        const subjectSchemaRelationDetails = await subjectSchemaRelation.findById(subjectSchemaRelationId);
        if (!subjectSchemaRelationDetails) {
            return res.status(404).json({ message: "SubjectSchemaRelation not found" });
        }

        // Check if task already assigned to this user
        const existingTask = await Task.findOne({ subjectSchemaRelationId });
        if (existingTask) {
            return res.status(400).json({ message: "Task already assigned to this subject relation" });
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
            taskName
        });
        const savedTask = await newTask.save({ session });

        // Save each PDF filename to the AnswerPdf table
        for (const fileName of pdfFileNames) {
            const answerPdf = new AnswerPdf({
                taskId: savedTask._id,
                answerPdfName: fileName
            });
            await answerPdf.save({ session });
        }

        // Commit the transaction
        await session.commitTransaction();

        // Respond with success
        res.status(200).json({ message: "Task assigned successfully", task: savedTask, pdfFiles: pdfFileNames });
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        console.error("Error assigning task:", error);
        res.status(500).json({ message: "Failed to assign task", error: error.message });
    } finally {
        // End the session
        session.endSession();
    }
};

const updateAssignedTask = async (req, res) => {
    const { userId, subjectSchemaRelationId, folderPath, status, taskName } = req.body;

    try {
        // Validate inputs
        if (!userId || !subjectSchemaRelationId || !folderPath || !taskName) {
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

        // Check if subject schema relation exists
        const subjectSchemaRelationDetails = await subjectSchemaRelation.findById(subjectSchemaRelationId);
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

        // Read folder contents and filter for PDF files
        let pdfFileNames = [];
        try {
            const files = await fs.promises.readdir(absoluteFolderPath);
            pdfFileNames = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
        } catch (error) {
            console.error("Error reading folder contents:", error);
            return res.status(400).json({ message: "Unable to read folder contents." });
        }

        // Ensure there are PDF files in the folder
        if (pdfFileNames.length === 0) {
            return res.status(400).json({ message: "No PDF files found in the folder." });
        }

        // Update the task
        const updatedTask = await Task.findOneAndUpdate(
            { userId, subjectSchemaRelationId },
            {
                folderPath,
                totalFiles: pdfFileNames.length,
                status,
                taskName
            },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Overwrite the AnswerPdf entries for this task
        await AnswerPdf.deleteMany({ taskId: updatedTask._id });
        for (const fileName of pdfFileNames) {
            const answerPdf = new AnswerPdf({
                taskId: updatedTask._id,
                answerPdfName: fileName
            });
            await answerPdf.save();
        }

        // Respond with the updated task and new PDF filenames
        res.status(200).json({
            message: "Task and associated PDFs updated successfully",
            task: updatedTask,
            pdfFiles: pdfFileNames
        });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task", error: error.message });
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
    console.log(id);
    try {

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid task ID." });
        }

        const task = await Task.findById(id);
        res.status(200).json(task);
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

