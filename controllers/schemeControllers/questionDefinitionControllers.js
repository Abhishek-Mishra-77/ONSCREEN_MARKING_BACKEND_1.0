import QuestionDefinition from "../../models/schemeModel/questionDefinitionSchema.js";
import { validateQuestionDefinition } from "../../errorHanding/validateQuestionDefinition.js";
import Schema from "../../models/schemeModel/schema.js";

const createQuestionDefinition = async (req, res) => {
    const {
        schemaId,
        parentQuestionId,
        questionsName,
        maxMarks,
        minMarks,
        bonusMarks,
        isSubQuestion,
        marksDifference,
        numberOfSubQuestions,
        compulsorySubQuestions,
    } = req.body;

    try {
        const errorMessage = validateQuestionDefinition({
            schemaId,
            questionsName,
            maxMarks,
            minMarks,
            bonusMarks,
            isSubQuestion,
            parentQuestionId: parentQuestionId ? parentQuestionId : null,
            marksDifference,
            numberOfSubQuestions,
            compulsorySubQuestions,
        });

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage });
        }

        const existingSchema = await Schema.findById(schemaId);

        if (!existingSchema) {
            return res.status(400).json({ message: "Invalid schemaId. Schema does not exist." });
        }

        if (isSubQuestion) {
            if (!parentQuestionId) {
                return res.status(400).json({ message: "Parent question is required for subquestions." });
            }

            const parentQuestion = await QuestionDefinition.findOne({
                _id: parentQuestionId,
                schemaId: schemaId,
            });

            if (!parentQuestion) {
                return res.status(400).json({ message: "Invalid parentQuestionId. Parent question does not exist under the specified schema." });
            }
        }

        const questionDefinitionData = {
            schemaId,
            parentQuestionId: isSubQuestion ? parentQuestionId : null,
            questionsName,
            maxMarks,
            minMarks,
            isSubQuestion,
            bonusMarks: bonusMarks || 0,
            marksDifference: marksDifference || 0,
            numberOfSubQuestions: isSubQuestion ? (numberOfSubQuestions || 0) : undefined,
            compulsorySubQuestions: isSubQuestion ? (compulsorySubQuestions || 0) : undefined,
        };

        const questionDefinition = new QuestionDefinition(questionDefinitionData);

        await questionDefinition.save();

        return res.status(201).json({
            message: "Question definition created successfully.",
            data: questionDefinition,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while creating the question definition." });
    }
};


const updateQuestionDefinition = async (req, res) => {

};


const removeQuestionDefinition = async (req, res) => {

};


const removeQuestionDefinitionBasedOnSchemeId = async (req, res) => {

};


const getQuestionDefinitionById = async (req, res) => {

};

const getAllPrimaryQuestionBasedOnSchemeId = async (req, res) => {

};

const getAllSubQuestionsBasedOnParentQuestionId = async (req, res) => {

};



export {
    createQuestionDefinition,
    updateQuestionDefinition,
    removeQuestionDefinition,
    removeQuestionDefinitionBasedOnSchemeId,
    getQuestionDefinitionById,
    getAllPrimaryQuestionBasedOnSchemeId,
    getAllSubQuestionsBasedOnParentQuestionId
}

