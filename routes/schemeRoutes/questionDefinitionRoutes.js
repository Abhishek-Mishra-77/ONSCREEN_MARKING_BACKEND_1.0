import express from 'express';
const router = express.Router();

import {
    createQuestionDefinition,
    updateQuestionDefinition,
    removeQuestionDefinition,
    getQuestionDefinitionById,
    getAllPrimaryQuestionBasedOnSchemeId,
} from "../../controllers/schemeControllers/questionDefinitionControllers.js"

import authMiddleware from "../../Middlewares/authMiddleware.js";


/* -------------------------------------------------------------------------- */
/*                           QUESTION DEFINITION ROUTES                       */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * tags:
 *   name: QuestionDefinitions
 *   description: Operations related to question definitions
 */

/**
 * @swagger
 * /api/schemas/create/questiondefinition:
 *   post:
 *     summary: Create a new question definition
 *     tags: [QuestionDefinitions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schemaId:
 *                 type: string
 *               parentQuestionId:
 *                 type: string
 *               questionsName:
 *                 type: string
 *               maxMarks:
 *                 type: number
 *               minMarks:
 *                 type: number
 *               bonusMarks:
 *                 type: number
 *               isSubQuestion:
 *                 type: boolean
 *               marksDifference:
 *                 type: number
 *               numberOfSubQuestions:
 *                 type: number
 *               compulsorySubQuestions:
 *                 type: number
 *     responses:
 *       201:
 *         description: Question definition created successfully.
 *       400:
 *         description: Invalid input data.
 *       500:
 *         description: Internal server error.
 */
router.post("/create/questiondefinition", authMiddleware, createQuestionDefinition);

/**
 * @swagger
 * /api/schemas/update/questiondefinition/{id}:
 *   put:
 *     summary: Update an existing question definition
 *     tags: [QuestionDefinitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the question definition
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schemaId:
 *                 type: string
 *               parentQuestionId:
 *                 type: string
 *               questionsName:
 *                 type: string
 *               maxMarks:
 *                 type: number
 *               minMarks:
 *                 type: number
 *               bonusMarks:
 *                 type: number
 *               isSubQuestion:
 *                 type: boolean
 *               marksDifference:
 *                 type: number
 *               numberOfSubQuestions:
 *                 type: number
 *               compulsorySubQuestions:
 *                 type: number
 *     responses:
 *       200:
 *         description: Question definition updated successfully.
 *       400:
 *         description: Invalid input data or question definition not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/update/questiondefinition/:id', authMiddleware, updateQuestionDefinition);

/**
 * @swagger
 * /api/schemas/remove/questiondefinition/{id}:
 *   delete:
 *     summary: Delete a question definition by ID
 *     tags: [QuestionDefinitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the question definition
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question definition removed successfully.
 *       404:
 *         description: Question definition not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/remove/questiondefinition/:id", authMiddleware, removeQuestionDefinition);

/**
 * @swagger
 * /api/schemas/get/questiondefinition/{id}:
 *   get:
 *     summary: Get a question definition by ID
 *     tags: [QuestionDefinitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the question definition
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question definition retrieved successfully.
 *       404:
 *         description: Question definition not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/get/questiondefinition/:id', authMiddleware, getQuestionDefinitionById);

/**
 * @swagger
 * /api/schemas/getall/questiondefinitions/{schemaId}:
 *   get:
 *     summary: Get all primary questions for a specific schema
 *     tags: [QuestionDefinitions]
 *     parameters:
 *       - in: path
 *         name: schemaId
 *         required: true
 *         description: The schema ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of primary questions retrieved successfully.
 *       404:
 *         description: No primary questions found for the given schema.
 *       500:
 *         description: Internal server error.
 */
router.get("/getall/questiondefinitions/:schemaId", authMiddleware, getAllPrimaryQuestionBasedOnSchemeId);


export default router;