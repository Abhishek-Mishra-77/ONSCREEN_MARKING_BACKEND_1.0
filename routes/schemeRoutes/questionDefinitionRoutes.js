import express from 'express';
const router = express.Router();

import {
    createQuestionDefinition,
    updateQuestionDefinition,
    removeQuestionDefinition,
    getQuestionDefinitionById,
    getAllPrimaryQuestionBasedOnSchemeId,
} from "../../controllers/schemeControllers/questionDefinitionControllers.js"


router.post("/create/questiondefinition", createQuestionDefinition);
router.put('/update/questiondefinition/:id', updateQuestionDefinition);
router.delete("/remove/questiondefinition/:id", removeQuestionDefinition);
router.get('/get/questiondefinition/:id', getQuestionDefinitionById);
router.get("/getall/questiondefinitions/:schemaId", getAllPrimaryQuestionBasedOnSchemeId);

export default router;