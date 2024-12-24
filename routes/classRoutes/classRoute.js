import express from "express";
const router = express.Router();

import authMiddleware from "../../Middlewares/authMiddleware.js";
import { createCourse, updateCourse, getAllCourses, getCourseById, removeCourse } from "../../controllers/classControllers/classController.js";

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: API for managing classes
 */

/* -------------------------------------------------------------------------- */
/*                           CLASS ROUTES                                     */
/* -------------------------------------------------------------------------- */

/**
 * @swagger
 * /api/classes/create/class:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - className
 *               - classCode
 *               - duration
 *               - session
 *               - year
 *             properties:
 *               className:
 *                 type: string
 *               classCode:
 *                 type: string
 *               duration:
 *                 type: string
 *               session:
 *                 type: string
 *               year:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Successfully created the class
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 className:
 *                   type: string
 *                 classCode:
 *                   type: string
 *                 duration:
 *                   type: string
 *                 session:
 *                   type: string
 *                 year:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isActive:
 *                   type: boolean
 *       400:
 *         description: Validation or class code already exists
 *       500:
 *         description: Internal server error
 */
router.post("/create/class", createCourse);


/**
 * @swagger
 * /api/classes/update/classes/{id}:
 *   put:
 *     summary: Update a class by ID
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the class to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               className:
 *                 type: string
 *               classCode:
 *                 type: string
 *               duration:
 *                 type: string
 *               session:
 *                 type: string
 *               year:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 className:
 *                   type: string
 *                 classCode:
 *                   type: string
 *                 duration:
 *                   type: string
 *                 session:
 *                   type: string
 *                 year:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isActive:
 *                   type: boolean
 *       400:
 *         description: Invalid ID or invalid input data
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal server error
 */
router.put("/update/classes/:id", authMiddleware, updateCourse);

/**
 * @swagger
 * /api/classes/get/class:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Internal server error
 */

router.get("/get/class", authMiddleware, getAllCourses);

/**
 * @swagger
 * /api/classes/getbyid/class/{id}:
 *   get:
 *     summary: Get a class by ID
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the class to be retrieved
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The class details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 className:
 *                   type: string
 *                 classCode:
 *                   type: string
 *                 duration:
 *                   type: number
 *                 session:
 *                   type: number
 *                 year:
 *                   type: string
 *                 startDate:
 *                   type: string
 *                   format: date
 *                 endDate:
 *                   type: string
 *                   format: date
 *                 isActive:
 *                   type: boolean
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal server error
 */
router.get("/getbyid/class/:id", authMiddleware, getCourseById);

/**
 * @swagger
 * /api/classes/remove/class/{id}:
 *   delete:
 *     summary: Remove a class by ID
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the class to be removed
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course removed successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Class not found
 *       500:
 *         description: Internal server error
 */
router.delete("/remove/class/:id", authMiddleware, removeCourse);

export default router;
