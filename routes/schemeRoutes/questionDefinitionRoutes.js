import express from 'express';
const router = express.Router();

import {
    createQuestionDifinition,
    updateQuestionDefinition,
    removeQuestionDifinition,
    removeQuestionDifinitionBasedOnSchemeId,
    getQuestionDefinitionById,
    getAllQuestionDefinationBasedOnSchemeId
} from "../../controllers/schemeControllers/questionDefinitionControllers.js"

router.post("/create/questiondefinition", createQuestionDifinition);
router.put('/update/questiondefinition/:id', updateQuestionDefinition) // QuestionDefinition - id
router.delete("/remove/questiondefinition/:id", removeQuestionDifinition) // QuestionDefinition - id
router.delete("/remove/questiondefinition/:schemeId", removeQuestionDifinitionBasedOnSchemeId) // schemeId
router.get('get/questiondefinition/:id', getQuestionDefinitionById) // QuestionDefinition - id
router.get("getall/questiondefinitions/:schemeId", getAllQuestionDefinationBasedOnSchemeId) // QuestionDefinition - schemeId

export default router;