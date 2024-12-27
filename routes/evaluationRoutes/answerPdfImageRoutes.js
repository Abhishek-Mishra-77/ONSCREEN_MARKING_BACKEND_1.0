import express from "express";
const router = express.Router();
import {
    getAnswerPdfImages,
    updateAnswerPdfImageById,
} from "../../controllers/evaluationControllers/answerPdfImageController.js";

import authMiddleware from "../../Middlewares/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: AnswerPdfImage
 *   description: API for managing AnswerPdfImage
 */

/**
 * @swagger
 * /api/evaluation/answerimages/getall/answerpdfimage/{answerPdfId}:
 *   get:
 *     summary: Get all answer pdf images by answer pdf ID
 *     tags: [AnswerPdfImage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: answerPdfId
 *         in: path
 *         required: true
 *         description: Answer pdf ID to retrieve answer pdf images for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of answer pdf images for the answer pdf
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AnswerPdfImage'
 *       400:
 *         description: Invalid answer pdf ID
 *       404:
 *         description: Answer pdf images not found
 *       500:
 *         description: Internal server error
 */
router.get("/getall/answerpdfimage/:answerPdfId", getAnswerPdfImages);

/**
 * @swagger
 * /api/evaluation/answerimages/update/answerpdfimage/{id}:
 *   put:
 *     summary: Update an answer pdf image by ID
 *     tags: [AnswerPdfImage]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the answer pdf image to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: Status of the answer pdf image
 *                 example: "approved"
 *     responses:
 *       200:
 *         description: Answer pdf image updated successfully
 *       400:
 *         description: Invalid request or missing fields
 *       404:
 *         description: Answer pdf image not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/answerpdfimage/:id", updateAnswerPdfImageById);

export default router;
