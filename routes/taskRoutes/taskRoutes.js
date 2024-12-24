import express from "express";
const router = express.Router();

import {
    assigningTask,
    updateAssignedTask,
    removeAssignedTask,
    getAssignTaskById,
    getAllAssignedTaskByUserId
} from "../../controllers/taskControllers/taskControllers.js";

import authMiddleware from "../../Middlewares/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: API for managing tasks
 */

/* -------------------------------------------------------------------------- */
/*                           TASK ROUTES                                      */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/tasks/create/task:
 *   post:
 *     summary: Assign a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - subjectSchemaRelationId
 *               - folderPath
 *               - status
 *               - taskName
 *             properties:
 *               userId:
 *                 type: string
 *               subjectSchemaRelationId:
 *                 type: string
 *               folderPath:
 *                 type: string
 *               status:
 *                 type: string
 *               taskName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   type: object
 *                 pdfFiles:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid input data or missing fields
 *       500:
 *         description: Internal server error
 */
router.post("/create/task", assigningTask);

/**
 * @swagger
 * /api/tasks/update/task/{id}:
 *   put:
 *     summary: Update an assigned task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the task to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - subjectSchemaRelationId
 *               - folderPath
 *               - status
 *               - taskName
 *             properties:
 *               userId:
 *                 type: string
 *               subjectSchemaRelationId:
 *                 type: string
 *               folderPath:
 *                 type: string
 *               status:
 *                 type: string
 *               taskName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   type: object
 *                 pdfFiles:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid task ID or input data
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/task/:id", updateAssignedTask);

/**
 * @swagger
 * /api/tasks/remove/task/{id}:
 *   delete:
 *     summary: Remove an assigned task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the task to be removed
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task and associated PDFs deleted successfully
 *       400:
 *         description: Invalid task ID
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.delete("/remove/task/:id", removeAssignedTask);

/**
 * @swagger
 * /api/tasks/get/task/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the task to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid task ID
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.get("/get/task/:id", getAssignTaskById);

/**
 * @swagger
 * /api/tasks/getall/tasks/{userId}:
 *   get:
 *     summary: Get all tasks assigned to a user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: User ID to retrieve tasks for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks assigned to the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Internal server error
 */
router.get("/getall/tasks/:userId", getAllAssignedTaskByUserId);

export default router;
