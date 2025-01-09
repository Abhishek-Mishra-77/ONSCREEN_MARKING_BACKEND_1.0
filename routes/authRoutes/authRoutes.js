import express from "express";
const router = express.Router();

import authMiddleware from "../../Middlewares/authMiddleware.js";
import {
    createUser,
    userLogin,
    verifyOtp,
    forgotPassword,
    removeUser,
    getUserById,
    getAllUsers,
    updateUserDetails,
    createUsersByCsvFile,
} from "../../controllers/authControllers/authControllers.js";

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Endpoints related to user authentication and management
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Create a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               mobile:
 *                 type: string
 *               role:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 *       500:
 *         description: Failed to send OTP
 */
router.post('/signup', authMiddleware, createUser);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum:
 *                   - password
 *                   - otp
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found. Please sign up first.
 */
router.post('/signin', userLogin);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify user OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Failed to verify OTP
 */
router.post('/verify', verifyOtp);


/**
 * @swagger
 * /api/auth/createuserbycsv:
 *   post:
 *     summary: Bulk create users using a CSV file
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: All users created successfully
 *       400:
 *         description: Invalid CSV file or missing data
 *       500:
 *         description: Failed to create users
 */
router.post('/createuserbycsv', authMiddleware, createUsersByCsvFile);

/**
 * @swagger
 * /api/auth/forgotpassword:
 *   put:
 *     summary: Reset password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Failed to reset password
 *       500:
 *         description: Internal server error
 */
router.put('/forgotpassword', forgotPassword);

/**
 * @swagger
 * /api/auth/update/{id}:
 *   put:
 *     summary: Update user details
 *     tags: [Authentication]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
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
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               role:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/update/:id', authMiddleware, updateUserDetails);


/**
 * @swagger
 * /api/auth/removeUser/{id}:
 *   delete:
 *     summary: Remove a user
 *     tags: [Authentication]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User removed successfully
 *       404:
 *         description: User not found
 */
router.delete('/removeUser/:id', authMiddleware, removeUser);


/**
 * @swagger
 * /api/auth/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Authentication]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', authMiddleware, getUserById);

/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Get all users
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 */
router.get('/', authMiddleware, getAllUsers);
    

export default router;
