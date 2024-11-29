import express from 'express';
const router = express.Router();

import {
    createQuestionDefinition,
    updateQuestionDefinition,
    removeQuestionDefinition,
    removeQuestionDefinitionBasedOnSchemeId,
    getQuestionDefinitionById,
    getAllPrimaryQuestionBasedOnSchemeId,
    getAllSubQuestionsBasedOnParentQuestionId
} from "../../controllers/schemeControllers/questionDefinitionControllers.js"


router.post("/create/questiondefinition", createQuestionDefinition); // creating primary question and sub question
router.put('/update/questiondefinition/:id', updateQuestionDefinition); //id
router.delete("/remove/questiondefinition/:id", removeQuestionDefinition);
router.delete("/remove/questiondefinition/:schemaId", removeQuestionDefinitionBasedOnSchemeId);
router.get('/get/questiondefinition/:id', getQuestionDefinitionById);
router.get("/getall/questiondefinitions/:schemaId", getAllPrimaryQuestionBasedOnSchemeId);
router.get("/getall/subquestions/:parentquestionid", getAllSubQuestionsBasedOnParentQuestionId); //parentquestionid

export default router;