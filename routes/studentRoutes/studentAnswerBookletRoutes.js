import express from "express";
const router = express();

import { processingBooklets } from "../../controllers/studentControllers/studentAnswerBooklet.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";

router.post('/processing', processingBooklets);

export default router;