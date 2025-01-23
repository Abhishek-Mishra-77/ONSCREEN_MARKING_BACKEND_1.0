import express from "express";
const router = express.Router();
import {
    getAnswerPdfImages,
    updateAnswerPdfImageById,
    savedAnswerImages,
    upload
} from "../../controllers/evaluationControllers/answerPdfImageController.js";

import authMiddleware from "../../Middlewares/authMiddleware.js";

router.get("/getall/answerpdfimage/:answerPdfId", getAnswerPdfImages);
router.put("/update/answerpdfimage/:id", updateAnswerPdfImageById);
router.post("/api/saveimages", upload.single("image"), savedAnswerImages);

export default router;
