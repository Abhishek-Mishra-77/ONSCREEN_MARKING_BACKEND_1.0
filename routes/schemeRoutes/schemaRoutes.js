import express from "express";
const router = express.Router();

import { createSchema, updateSchema, getSchemaById, getAllSchemas, removeSchema, getAllCompletedSchema } from "../../controllers/schemeControllers/schemaControllers.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Schemas
 *   description: Schema management API
 */

/* -------------------------------------------------------------------------- */
/*                           SCHEMA ROUTES                                    */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/schemas/create/schema:
 *   post:
 *     summary: Create a new schema
 *     description: This endpoint is used to create a new schema.
 *     tags: [Schemas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - totalQuestions
 *               - maxMarks
 *               - minMarks
 *               - evaluationTime
 *             properties:
 *               name:
 *                 type: string
 *               totalQuestions:
 *                 type: integer
 *               maxMarks:
 *                 type: integer
 *               minMarks:
 *                 type: integer
 *               compulsoryQuestions:
 *                 type: integer
 *               evaluationTime:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Schema created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Missing required fields or invalid data.
 *       500:
 *         description: Internal server error.
 */
router.post("/create/schema", authMiddleware, createSchema);

/**
 * @swagger
 * /api/schemas/update/schema/{id}:
 *   put:
 *     summary: Update an existing schema
 *     description: This endpoint is used to update an existing schema by ID.
 *     tags: [Schemas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the schema to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               totalQuestions:
 *                 type: integer
 *               maxMarks:
 *                 type: integer
 *               minMarks:
 *                 type: integer
 *               compulsoryQuestions:
 *                 type: integer
 *               evaluationTime:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Schema updated successfully.
 *       400:
 *         description: Missing required fields or invalid data.
 *       404:
 *         description: Schema not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/update/schema/:id", authMiddleware, updateSchema);

/**
 * @swagger
 * /api/schemas/remove/schema/{id}:
 *   delete:
 *     summary: Remove a schema by ID
 *     description: This endpoint removes a schema by its ID along with associated question definitions.
 *     tags: [Schemas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the schema to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schema and associated questions removed successfully.
 *       404:
 *         description: Schema not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/remove/schema/:id", authMiddleware, removeSchema);


/**
 * @swagger
 * /api/schemas/get/schema/{id}:
 *   get:
 *     summary: Get a schema by ID
 *     description: This endpoint retrieves a schema by its ID.
 *     tags: [Schemas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the schema to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schema retrieved successfully.
 *       404:
 *         description: Schema not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/get/schema/:id", authMiddleware, getSchemaById);

/**
 * @swagger
 * /api/schemas/getall/schema:
 *   get:
 *     summary: Get all schemas
 *     description: This endpoint retrieves all schemas.
 *     tags: [Schemas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all schemas.
 *       500:
 *         description: Internal server error.
 */
router.get("/getall/schema", getAllSchemas);

/**
 * @swagger
 * /api/schemas/getall/completed/schema:
 *   get:
 *     summary: Get all completed schemas
 *     description: |
 *       This endpoint retrieves all schemas that have been marked as completed
 *       (status: true). The schemas that are marked as completed will be
 *       returned as part of the response.
 *     tags: [Schemas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of completed schemas.
 *       500:
 *         description: Internal server error.
 */

router.get("/getall/completed/schema", authMiddleware, getAllCompletedSchema);



export default router;
