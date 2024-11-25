import express from 'express';
const router = express.Router();

import {
    createQuestionDefinition,
    updateQuestionDefinition,
    removeQuestionDefinition,
    removeQuestionDefinitionBasedOnSchemeId,
    getQuestionDefinitionById,
    getAllQuestionDefinitionBasedOnSchemeId
} from "../../controllers/schemeControllers/questionDefinitionControllers.js"

router.post("/create/questiondefinition", createQuestionDefinition);
router.put('/update/questiondefinition/:id', updateQuestionDefinition);
router.delete("/remove/questiondefinition/:id", removeQuestionDefinition);
router.delete("/remove/questiondefinition/:schemaId", removeQuestionDefinitionBasedOnSchemeId);
router.get('/get/questiondefinition/:id', getQuestionDefinitionById);
router.get("/getall/questiondefinitions/:schemaId", getAllQuestionDefinitionBasedOnSchemeId);

export default router;