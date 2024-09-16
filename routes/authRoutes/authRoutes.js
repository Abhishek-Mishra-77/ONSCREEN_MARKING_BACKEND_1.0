import express from "express";
const router = express.Router();

import { createUser, userLogin, verifyOtp } from "../../controllers/authControllers/authControllers.js";

router.post('/signup', createUser);
router.post('/signin', userLogin);
router.post('/verify', verifyOtp);


export default router;

