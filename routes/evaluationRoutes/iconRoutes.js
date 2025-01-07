import express from "express";
const router = express.Router();

import {
    createIconHandler,
    updateIconHandler,
    removeIconByIdHandler,
    getIconsById,
    getAllIconsByQuestionIdAndAnswerImageId
} from "../../controllers/evaluationControllers/iconController.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Icons
 *   description: API for managing icons
 */

/* -------------------------------------------------------------------------- */
/*                           ICON ROUTES                                      */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/evaluation/icons/create:
 *   post:
 *     summary: Create a new icon
 *     tags: [Icons]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answerPdfImageId:
 *                 type: string
 *                 description: The ID of the answer PDF image
 *               questionDefinitionId:
 *                 type: string
 *                 description: The ID of the question definition
 *               iconUrl:
 *                 type: string
 *                 description: The URL of the icon image
 *               question:
 *                 type: string
 *                 description: The question related to the icon
 *               timeStamps:
 *                 type: string
 *                 description: The timestamps related to the icon
 *               x:
 *                 type: string
 *                 description: The x position of the icon
 *               y:
 *                 type: string
 *                 description: The y position of the icon
 *               width:
 *                 type: string
 *                 description: The width of the icon
 *               height:
 *                 type: string
 *                 description: The height of the icon
 *               mark:
 *                 type: string
 *                 description: The mark associated with the icon
 *     responses:
 *       201:
 *         description: The created icon
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 answerPdfImageId:
 *                   type: string
 *                 questionDefinitionId:
 *                   type: string
 *                 iconUrl:
 *                   type: string
 *                 question:
 *                   type: string
 *                 timeStamps:
 *                   type: string
 *                 x:
 *                   type: string
 *                 y:
 *                   type: string
 *                 width:
 *                   type: string
 *                 height:
 *                   type: string
 *                 mark:
 *                   type: string
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post("/create", createIconHandler);

/**
 * @swagger
 * /api/evaluation/icons/update/{id}:
 *   put:
 *     summary: Update an existing icon by ID
 *     tags: [Icons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the icon to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answerPdfImageId:
 *                 type: string
 *                 description: The ID of the answer PDF image
 *               questionDefinitionId:
 *                 type: string
 *                 description: The ID of the question definition
 *               iconUrl:
 *                 type: string
 *                 description: The URL of the icon image
 *               question:
 *                 type: string
 *                 description: The question related to the icon
 *               timeStamps:
 *                 type: string
 *                 description: The timestamps related to the icon
 *               x:
 *                 type: string
 *                 description: The x position of the icon
 *               y:
 *                 type: string
 *                 description: The y position of the icon
 *               width:
 *                 type: string
 *                 description: The width of the icon
 *               height:
 *                 type: string
 *                 description: The height of the icon
 *               mark:
 *                 type: string
 *                 description: The mark associated with the icon
 *     responses:
 *       200:
 *         description: The updated icon
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 answerPdfImageId:
 *                   type: string
 *                 questionDefinitionId:
 *                   type: string
 *                 iconUrl:
 *                   type: string
 *                 question:
 *                   type: string
 *                 timeStamps:
 *                   type: string
 *                 x:
 *                   type: string
 *                 y:
 *                   type: string
 *                 width:
 *                   type: string
 *                 height:
 *                   type: string
 *                 mark:
 *                   type: string
 *       400:
 *         description: Invalid request body or ID supplied
 *       404:
 *         description: Icon not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/:id", updateIconHandler);

/**
 * @swagger
 * /api/evaluation/icons/geticons:
 *   get:
 *     summary: Retrieve all icons by questionDefinitionId and answerPdfImageId
 *     tags: [Icons]
 *     parameters:
 *       - in: query
 *         name: questionDefinitionId
 *         required: true
 *         description: The ID of the question definition
 *         schema:
 *           type: string
 *       - in: query
 *         name: answerPdfImageId
 *         required: true
 *         description: The ID of the answer PDF image
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of icons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   answerPdfImageId:
 *                     type: string
 *                   questionDefinitionId:
 *                     type: string
 *                   iconUrl:
 *                     type: string
 *                   question:
 *                     type: string
 *                   timeStamps:
 *                     type: string
 *                   x:
 *                     type: string
 *                   y:
 *                     type: string
 *                   width:
 *                     type: string
 *                   height:
 *                     type: string
 *                   mark:
 *                     type: string
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get("/geticons", getAllIconsByQuestionIdAndAnswerImageId);

/**
 * @swagger
 * /api/evaluation/icons/get/{id}:
 *   get:
 *     summary: Retrieve a specific icon by ID
 *     tags: [Icons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the icon to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested icon
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 answerPdfImageId:
 *                   type: string
 *                 questionDefinitionId:
 *                   type: string
 *                 iconUrl:
 *                   type: string
 *                 question:
 *                   type: string
 *                 timeStamps:
 *                   type: string
 *                 x:
 *                   type: string
 *                 y:
 *                   type: string
 *                 width:
 *                   type: string
 *                 height:
 *                   type: string
 *                 mark:
 *                   type: string
 *       400:
 *         description: Invalid ID supplied
 *       404:
 *         description: Icon not found
 *       500:
 *         description: Internal server error
 */
router.get("/get/:id", getIconsById);

/**
 * @swagger
 * /api/evaluation/icons/remove:
 *   delete:
 *     summary: Delete an icon by ID
 *     tags: [Icons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: iconsId
 *         required: true
 *         description: The ID of the icon to delete
 *         schema:
 *           type: string
 *       - in: query
 *         name: answerPdfId
 *         required: true
 *         description: The ID of the associated answer PDF
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Icon successfully deleted
 *       400:
 *         description: Invalid query parameters
 *       404:
 *         description: Icon or associated marks not found
 *       500:
 *         description: Internal server error
 */
router.delete("/remove", removeIconByIdHandler);


export default router;
