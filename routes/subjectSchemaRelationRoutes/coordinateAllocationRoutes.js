import express from "express";
const router = express.Router();

import {
    createCoordinateAllocation,
    updateCoordinateAllocation,
    deleteCoordinateAllocation,
    getCoordinateAllocationById,
    getCoordinateAllocationBySubjectSchemaRelationId,
    getCoordinateAllocationBySubjectIdStatusTrue
} from "../../controllers/subjectSchemaRelation/coordinateAllocation.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Coordinate Allocation
 *   description: Manage Coordinate Allocation for course schema relations.
 */

/* -------------------------------------------------------------------------- */
/*                           COORDINATE ALLOCATION ROUTES                     */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/coordinates/createcoordinateallocation:
 *   post:
 *     summary: Create a new Coordinate Allocation
 *     tags: [Coordinate Allocation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseSchemaRelationId
 *               - questionId
 *               - questionImages
 *               - answerImages
 *             properties:
 *               courseSchemaRelationId:
 *                 type: string
 *               questionId:
 *                 type: string
 *               questionImages:
 *                 type: array
 *                 items:
 *                   type: string
 *               answerImages:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Coordinate Allocation created successfully.
 *       400:
 *         description: Invalid data or missing required fields.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/createcoordinateallocation", authMiddleware, createCoordinateAllocation);

/**
 * @swagger
 * /api/coordinates/updatecoordinateallocation/{id}:
 *   put:
 *     summary: Update an existing Coordinate Allocation
 *     tags: [Coordinate Allocation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the Coordinate Allocation to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionImages
 *               - answerImages
 *             properties:
 *               questionImages:
 *                 type: array
 *                 items:
 *                   type: string
 *               answerImages:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Coordinate Allocation updated successfully.
 *       400:
 *         description: Invalid data or missing required fields.
 *       404:
 *         description: Coordinate Allocation not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/updatecoordinateallocation/:id", authMiddleware, updateCoordinateAllocation);

/**
 * @swagger
 * /api/coordinates/deletecoordinateallocation/{id}:
 *   delete:
 *     summary: Delete a Coordinate Allocation by ID
 *     tags: [Coordinate Allocation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the Coordinate Allocation to delete.
 *     responses:
 *       200:
 *         description: Coordinate Allocation deleted successfully.
 *       404:
 *         description: Coordinate Allocation not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/deletecoordinateallocation/:id", authMiddleware, deleteCoordinateAllocation);

/**
 * @swagger
 * /api/coordinates/getcoordinateallocationbyid/{id}:
 *   get:
 *     summary: Get a Coordinate Allocation by ID
 *     tags: [Coordinate Allocation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the Coordinate Allocation to retrieve.
 *     responses:
 *       200:
 *         description: Coordinate Allocation retrieved successfully.
 *       404:
 *         description: Coordinate Allocation not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/getcoordinateallocationbyid/:id", authMiddleware, getCoordinateAllocationById);

/**
 * @swagger
 * /api/coordinates/getcoordinateallocationbysubjectidstatustrue/{courseSchemaRelationId}:
 *   get:
 *     summary: Get all Coordinate Allocations for a specific course schema relation ID with status true
 *     tags: [Coordinate Allocation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: courseSchemaRelationId
 *         in: path
 *         required: true
 *         description: The ID of the course schema relation.
 *     responses:
 *       200:
 *         description: List of Coordinate Allocations retrieved successfully.
 *       404:
 *         description: No Coordinate Allocations found.
 *       500:
 *         description: Internal server error.
 */
router.get("/getcoordinateallocationbysubjectidstatustrue/:courseSchemaRelationId", authMiddleware, getCoordinateAllocationBySubjectIdStatusTrue);

/**
 * @swagger
 * /api/coordinates/getcoordinateallocationbyschemarelationid/{courseSchemaRelationId}:
 *   get:
 *     summary: Get all Coordinate Allocations by Course Schema Relation ID
 *     tags: [Coordinate Allocation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: courseSchemaRelationId
 *         in: path
 *         required: true
 *         description: The ID of the course schema relation.
 *     responses:
 *       200:
 *         description: List of Coordinate Allocations retrieved successfully.
 *       404:
 *         description: No Coordinate Allocations found.
 *       500:
 *         description: Internal server error.
 */
router.get("/getcoordinateallocationbyschemarelationid/:courseSchemaRelationId", authMiddleware, getCoordinateAllocationBySubjectSchemaRelationId);

export default router;
