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
router.put('/update/subquestion/:id', updateSubQuestion)
router.delete('/remove/subquestion/:id', removeSubQuestionById)
router.delete('/remove/subquestions/:questionDefinitionId', removeSubQuestionsBasedOnQuestionDefinitionId)
router.get('/get/subquestion/:id', getSubQuestionById)
router.get('/getall/subquestions/:questionDefinitionId', getAllSubQuestionsBasedOnQuestionDefinitionId)

export default router;