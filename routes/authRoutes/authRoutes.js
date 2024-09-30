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
    createUsersByCsvFile
} from "../../controllers/authControllers/authControllers.js";

router.post('/signup', authMiddleware, createUser);
router.post('/signin', userLogin);
router.post('/verify', verifyOtp);
router.put('/forgotpassword', forgotPassword);
router.get('/:id', authMiddleware, getUserById);
router.get('/', authMiddleware, getAllUsers);
router.delete('/removeUser/:id', authMiddleware, removeUser);
router.put('/update/:id', authMiddleware, updateUserDetails);
router.post('/createuserbycsv', createUsersByCsvFile);

export default router;

