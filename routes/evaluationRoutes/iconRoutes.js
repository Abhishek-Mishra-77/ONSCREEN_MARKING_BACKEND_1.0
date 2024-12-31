import express from "express";
const router = express.Router();

import {
    createIconHandler,
    updateIconHandler,
    removeIconByIdHandler,
    getIconsById,
    getAllIconsByQuestionIdAndAnswerImageId,
    removeAllAsscoiatedIcons
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
 * /icons:
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
 *             $ref: '#/components/schemas/Icon'
 *     responses:
 *       201:
 *         description: The created icon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Icon'
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post("/create", createIconHandler);

/**
 * @swagger
 * /icons/{id}:
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
 *             $ref: '#/components/schemas/Icon'
 *     responses:
 *       200:
 *         description: The updated icon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Icon'
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
 * /icons:
 *   get:
 *     summary: Retrieve all icons
 *     tags: [Icons]
 *     responses:
 *       200:
 *         description: A list of icons
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Icon'
 *       500:
 *         description: Internal server error
 */
router.get("/geticons", getAllIconsByQuestionIdAndAnswerImageId);

/**
 * @swagger
 * /icons/{id}:
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
 *               $ref: '#/components/schemas/Icon'
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
 * /icons/{id}:
 *   delete:
 *     summary: Delete an icon by ID
 *     tags: [Icons]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the icon to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Icon successfully deleted
 *       404:
 *         description: Icon not found
 *       500:
 *         description: Internal server error
 */
router.delete("/remove", removeIconByIdHandler);

/**
 * @swagger
 * /icons/removeall:
 *   delete:
 *     summary: Delete all icons
 *     tags: [Icons]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All icons successfully deleted
 *       500:
 *         description: Internal server error
 */
router.delete("/removeall", removeAllAsscoiatedIcons);

export default router;
