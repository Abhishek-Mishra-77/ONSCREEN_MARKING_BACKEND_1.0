import express from "express";
const router = express.Router();

import { onSaveQuestionsFile, uploadQuestionsFile } from "../../controllers/schemeControllers/questions.js";

router.post("/save/questionsfile/:id", uploadQuestionsFile, onSaveQuestionsFile);

export default router;
