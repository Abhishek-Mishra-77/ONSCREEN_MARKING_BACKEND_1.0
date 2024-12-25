import express from "express";
const router = express.Router();

import {
    createSubject,
    removeSubject,
    getSubjectById,
    getAllSubjects,
    updateSubject,
    getAllSubjectBasedOnClassId
} from "../../controllers/classControllers/subjectControllers.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Subjects
 *   description: Subject management API
 */

/* -------------------------------------------------------------------------- */
/*                           SUBJECT ROUTES                                   */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/subjects/create/subject:
 *   post:
 *     summary: Create a new subject
 *     description: This endpoint is used to create a new subject for a specific class.
 *     tags: [Subjects]
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
 *               - code
 *               - classId
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the subject
 *               code:
 *                 type: string
 *                 description: The unique code for the subject
 *               classId:
 *                 type: string
 *                 description: The class ID the subject belongs to
 *     responses:
 *       201:
 *         description: Subject created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the created subject
 *                 name:
 *                   type: string
 *                 code:
 *                   type: string
 *                 classId:
 *                   type: string
 *       400:
 *         description: Missing required fields or invalid data.
 *       500:
 *         description: Internal server error.
 */
router.post("/create/subject", authMiddleware, createSubject);


/**
 * @swagger
 * /api/subjects/update/subject/{id}:
 *   put:
 *     summary: Update an existing subject
 *     description: This endpoint updates an existing subject by its ID.
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the subject to update
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
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subject updated successfully.
 *       400:
 *         description: Missing required fields or invalid data.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/update/subject/:id", authMiddleware, updateSubject);


/**
 * @swagger
 * /api/subjects/remove/subject/{id}:
 *   delete:
 *     summary: Remove a subject by ID
 *     description: This endpoint removes a subject by its ID.
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the subject to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject successfully removed.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/remove/subject/:id", authMiddleware, removeSubject);

/**
 * @swagger
 * /api/subjects/getbyid/subject/{id}:
 *   get:
 *     summary: Get a subject by ID
 *     description: This endpoint retrieves a subject by its ID.
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the subject to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject retrieved successfully.
 *       404:
 *         description: Subject not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/getbyid/subject/:id", authMiddleware, getSubjectById);

/**
 * @swagger
 * /api/subjects/getall/subject:
 *   get:
 *     summary: Get all subjects
 *     description: This endpoint retrieves all subjects.
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subjects.
 *       500:
 *         description: Internal server error.
 */
router.get("/getall/subject", authMiddleware, getAllSubjects);


/**
 * @swagger
 * /api/subjects/getallsubjectbasedonclass/{classId}:
 *   get:
 *     summary: Get all subjects by class ID
 *     description: This endpoint retrieves all subjects based on the class ID.
 *     tags: [Subjects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         description: The ID of the class to get subjects for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subjects for the class.
 *       400:
 *         description: Invalid class ID.
 *       500:
 *         description: Internal server error.
 */
router.get("/getallsubjectbasedonclass/:classId", authMiddleware, getAllSubjectBasedOnClassId);

export default router;
