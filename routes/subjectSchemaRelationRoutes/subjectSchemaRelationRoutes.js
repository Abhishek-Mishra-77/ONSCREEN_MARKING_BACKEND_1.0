import express from 'express';
const router = express.Router();

import {
    createSubjectSchemaRelation,
    getSubjectSchemaRelationById,
    deleteSubjectSchemaRelationById,
    updateSubjectSchemaRelation,
    getAllSubjectSchemaRelationBySubjectId,
    getAllSubjectSchemaRelationBySchemaId,
    getAllSubjectSchemaRelationBySchemaIdAndSubjectId,
    getAllSubjectSchemaRelationBySubjectIdCoordinateStatusTrue
} from "../../controllers/subjectSchemaRelation/subjectSchemaRelation.js"

import uploadMiddleware from '../../controllers/subjectSchemaRelation/uploadingPdf.js';
import authMiddleware from "../../Middlewares/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Subject Schema Relation
 *   description: Operations related to subject schema relations.
 */

/**
 * @swagger
 * /api/subjects/relations/createsubjectschemarel:
 *   post:
 *     summary: Create a new subject schema relation
 *     tags: [Subject Schema Relation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - schemaId
 *               - subjectId
 *               - relationName
 *             properties:
 *               schemaId:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               relationName:
 *                 type: string
 *               questionPdf:
 *                 type: string
 *                 format: binary
 *               answerPdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Subject schema relation created successfully.
 *       400:
 *         description: Missing required fields or invalid data.
 *       500:
 *         description: Internal server error.
 */
router.post('/createsubjectschemarel', authMiddleware, uploadMiddleware, createSubjectSchemaRelation);

/**
 * @swagger
 * /api/subjects/relations/getsubjectbyid/{id}:
 *   get:
 *     summary: Get subject schema relation by ID
 *     tags: [Subject Schema Relation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the subject schema relation to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject schema relation retrieved successfully.
 *       404:
 *         description: Subject schema relation not found.
 *       400:
 *         description: Invalid ID format.
 *       500:
 *         description: Internal server error.
 */
router.get('/getsubjectbyid/:id', getSubjectSchemaRelationById);

/**
 * @swagger
 * /api/subjects/relations/deletesubjectbyid/{id}:
 *   delete:
 *     summary: Delete subject schema relation by ID
 *     tags: [Subject Schema Relation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the subject schema relation to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject schema relation deleted successfully.
 *       404:
 *         description: Subject schema relation not found.
 *       400:
 *         description: Invalid ID format.
 *       500:
 *         description: Internal server error.
 */
router.delete('/deletesubjectbyid/:id', authMiddleware, deleteSubjectSchemaRelationById);

/**
 * @swagger
 * /api/subjects/relations/updatesubjectbyid/{id}:
 *   put:
 *     summary: Update subject schema relation by ID
 *     tags: [Subject Schema Relation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the subject schema relation to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - schemaId
 *               - subjectId
 *               - relationName
 *               - coordinateStatus
 *             properties:
 *               schemaId:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               relationName:
 *                 type: string
 *               coordinateStatus:
 *                 type: boolean
 *               questionPdf:
 *                 type: string
 *                 format: binary
 *               answerPdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Subject schema relation updated successfully.
 *       400:
 *         description: Invalid data or missing fields.
 *       404:
 *         description: Subject schema relation not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/updatesubjectbyid/:id', authMiddleware, uploadMiddleware, updateSubjectSchemaRelation);

/**
 * @swagger
 * /api/subjects/relations/getallsubjectschemarelationstatustrue/{subjectId}:
 *   get:
 *     summary: Get all subject schema relations with coordinateStatus true
 *     tags: [Subject Schema Relation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: subjectId
 *         in: path
 *         required: true
 *         description: The ID of the subject.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject schema relations retrieved successfully.
 *       404:
 *         description: No subject schema relations found with the given status.
 *       400:
 *         description: Invalid subject ID format.
 *       500:
 *         description: Internal server error.
 */
router.get('/getallsubjectschemarelationstatustrue/:subjectId', authMiddleware, getAllSubjectSchemaRelationBySubjectIdCoordinateStatusTrue);

/**
 * @swagger
 * /api/subjects/relations/getallsubjectbyid/{subjectId}:
 *   get:
 *     summary: Get all subject schema relations by subject ID
 *     tags: [Subject Schema Relation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: subjectId
 *         in: path
 *         required: true
 *         description: The ID of the subject.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject schema relations retrieved successfully.
 *       404:
 *         description: No subject schema relations found for the given subject.
 *       400:
 *         description: Invalid subject ID format.
 *       500:
 *         description: Internal server error.
 */
router.get('/getallsubjectbyid/:subjectId', authMiddleware, getAllSubjectSchemaRelationBySubjectId);

/**
 * @swagger
 * /api/subjects/relations/getallschemabyid/{schemaId}:
 *   get:
 *     summary: Get all subject schema relations by schema ID
 *     tags: [Subject Schema Relation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schemaId
 *         in: path
 *         required: true
 *         description: The ID of the schema.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject schema relations retrieved successfully.
 *       404:
 *         description: No subject schema relations found for the given schema.
 *       400:
 *         description: Invalid schema ID format.
 *       500:
 *         description: Internal server error.
 */
router.get('/getallschemabyid/:schemaId', authMiddleware, getAllSubjectSchemaRelationBySchemaId);

/**
 * @swagger
 * /api/subjects/relations/getallschemabyidandsubjectid/{schemaId}/{subjectId}:
 *   get:
 *     summary: Get subject schema relations by schema ID and subject ID
 *     tags: [Subject Schema Relation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schemaId
 *         in: path
 *         required: true
 *         description: The ID of the schema.
 *         schema:
 *           type: string
 *       - name: subjectId
 *         in: path
 *         required: true
 *         description: The ID of the subject.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject schema relations retrieved successfully.
 *       404:
 *         description: No subject schema relations found for the given schema and subject.
 *       400:
 *         description: Invalid schema ID or subject ID format.
 *       500:
 *         description: Internal server error.
 */
router.get('/getallschemabyidandsubjectid/:schemaId/:subjectId', authMiddleware, getAllSubjectSchemaRelationBySchemaIdAndSubjectId);

export default router;
