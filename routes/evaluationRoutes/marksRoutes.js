import express from 'express';
const router = express.Router();

import {
    createMarks,
    updateMarks
} from "../../controllers/evaluationControllers/marksController.js";

import authMiddleware from "../../Middlewares/authMiddleware.js";


/**
 * @swagger
 * tags:
 *   name: Marks
 *   description: API for managing marks
 */

/* -------------------------------------------------------------------------- */
/*                           MARKS ROUTES                                     */
/* -------------------------------------------------------------------------- */

/**
 * 
 * @swagger
 * /api/evaluation/marks/create:
 *   post:
 *     summary: Create a new marks
 *     tags: [Marks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionDefinitionId:
 *                 type: string
 *               answerPdfId:
 *                 type: string
 *               allottedMarks:
 *                 type: number
 *               timerStamps:
 *                 type: string
 *     responses:
 *       200:
 *         description: Marks created successfully  
 *       400:
 *         description: Invalid marks data
 *       500:
 *         description: Failed to create marks
 * 
 */

router.post('/create', createMarks);

/**
 * 
 * @swagger
 * /api/evaluation/marks/update/{id}:
 *   put:
 *     summary: Update an existing marks
 *     tags: [Marks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the marks to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionDefinitionId:
 *                 type: string
 *               answerPdfId:
 *                 type: string
 *               allottedMarks:
 *                 type: number 
 *               timerStamps:
 *                 type: string
 *     responses:
 *       200:
 *         description: Marks updated successfully
 *       400:
 *         description: Invalid marks data
 *       404:
 *         description: Marks not found
 *       500:
 *         description: Failed to update marks
 * 
 */

router.put('/update/:id', authMiddleware, updateMarks);





export default router;