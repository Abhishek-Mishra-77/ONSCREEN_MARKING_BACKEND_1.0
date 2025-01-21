import express from "express";
const router = express.Router();
import {
    getAnswerPdfImages,
    updateAnswerPdfImageById,
} from "../../controllers/evaluationControllers/answerPdfImageController.js";

import authMiddleware from "../../Middlewares/authMiddleware.js";

router.get("/getall/answerpdfimage/:answerPdfId", getAnswerPdfImages);
router.put("/update/answerpdfimage/:id", updateAnswerPdfImageById);

export default router;
