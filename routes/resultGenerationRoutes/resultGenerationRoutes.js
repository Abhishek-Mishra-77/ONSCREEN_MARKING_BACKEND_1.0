import express from "express";
const router = express.Router();

import { generateResult } from "../../controllers/resultGenerationContollers/resultGeneration.js";
import upload from "../../services/uploadFile.js";

/* -------------------------------------------------------------------------- */
/*                           RESULT GENERATION ROUTES                         */
/* -------------------------------------------------------------------------- */

router.post('/generate', upload.single('csvFilePath'), generateResult);

export default router;