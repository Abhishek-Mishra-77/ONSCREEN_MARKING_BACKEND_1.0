import express from "express";
const router = express.Router();

import {
    createSubQuestion,
    updateSubQuestion,
    removeSubQuestionById,
    removeSubQuestionsBasedOnQuestionDefinitionId,
    getSubQuestionById,
    getAllSubQuestionsBasedOnQuestionDefinitionId
} from "../../controllers/schemeControllers/subQuestionsControllers.js";


router.post('/create/subquestion', createSubQuestion);
router.put('/update/subquestion/:id', updateSubQuestion) // SubQuestionId - id
router.delete('/remove/subquestion/:id', removeSubQuestionById) //SubQuestionId - id
router.delete('/remove/subquestion/:questiondefinitionId', removeSubQuestionsBasedOnQuestionDefinitionId) // questiondefinitionId
router.get('/get/subquestion/:id', getSubQuestionById) // SubQuestionId - id
router.get('/getall/subquestions/:questiondefinitionId', getAllSubQuestionsBasedOnQuestionDefinitionId) // questiondefinitionId

export default router;