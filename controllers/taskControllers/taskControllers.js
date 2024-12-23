import fs from "fs";
import path from "path";
import Task from "../../models/taskModels/taskModel.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";
import User from "../../models/authModels/User.js";
import subjectSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootFolder = path.join(__dirname, '..', '..', process.env.BASE_DIR);

const assigningTask = async (req, res) => {
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

        // Asynchronously read the folder and count files
        let totalFiles = 0;
        try {
            const files = await fs.promises.readdir(absoluteFolderPath);
            const fileStats = await Promise.all(
                files.map(async (file) => {
                    const filePath = path.join(absoluteFolderPath, file);
                    const stats = await fs.promises.stat(filePath);
                    return stats.isFile();
                })
            );
            totalFiles = fileStats.filter(Boolean).length;
        } catch (error) {
            console.error("Error reading folder contents:", error);
            return res.status(400).json({ message: "Unable to read folder contents." });
        }


        if (totalFiles === 0) {
            return res.status(400).json({ message: "Folder is empty total files are 0." });
        }

        // Create and save the new task with the file count
        const newTask = new Task({
            userId,
            subjectSchemaRelationId,
            folderPath,
            totalFiles,
            status,
            taskName
        });
        const savedTask = await newTask.save();

        // Respond with success
        res.status(200).json({ message: "Task assigned successfully", task: savedTask });
    } catch (error) {
        console.error("Error assigning task:", error);
        res.status(500).json({ message: "Failed to assign task", error: error.message });
    }
};

const updateAssignedTask = async (req, res) => {
    const { userId, subjectSchemaRelationId, folderPath, status, taskName } = req.body;
    try {

        if (!userId || !subjectSchemaRelationId || !folderPath || !taskName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        if (!isValidObjectId(subjectSchemaRelationId)) {
            return res.status(400).json({ message: "Invalid subjectSchemaRelationId." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const subjectSchemaRelationDetails = await subjectSchemaRelation.findById(subjectSchemaRelationId);
        if (!subjectSchemaRelationDetails) {
            return res.status(404).json({ message: "SubjectSchemaRelation not found" });
        }

        const updatedTask = await Task.findOneAndUpdate(
            { userId, subjectSchemaRelationId },
            { folderPath, totalFiles, status, taskName },
            { new: true }
        );

        res.status(200).json({ message: "Task updated successfully", task: updatedTask });

    }
    catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task", error: error.message });
    }
};

const removeAssignedTask = async (req, res) => {
    const { id } = req.params;
    try {

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid task ID." });
        }

        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
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

