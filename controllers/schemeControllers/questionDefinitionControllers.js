import QuestionDefinition from "../../models/schemeModel/questionDefinitionSchema.js";
import { validateQuestionDefinition } from "../../errorHanding/validateQuestionDefinition.js";
import Schema from "../../models/schemeModel/schema.js";


const createQuestionDefinition = async (req, res) => {
    const {
        schemaId,
        questionsName,
        maxMarks,
        minMarks,
        isSubQuestion,
        bonusMarks,
        marksDifference,
        numberOfSubQuestions,
        compulsorySubQuestions,
    } = req.body;

    try {
        // Validate inputs
        const errorMessage = validateQuestionDefinition({
            schemaId,
            questionsName,
            maxMarks,
            minMarks,
            isSubQuestion,
            bonusMarks,
            marksDifference,
            numberOfSubQuestions,
            compulsorySubQuestions,
        });

        if (errorMessage) {
            return res.status(400).json({ message: errorMessage });
        }

        // Check if the schemaId exists in the Schema collection
        const existingSchema = await Schema.findById(schemaId);

        if (!existingSchema) {
            return res.status(400).json({ message: "Invalid schemaId. Schema does not exist." });
        }


        // Create the question definition
        const questionDefinition = new QuestionDefinition({
            schemaId,
            questionsName,
            maxMarks,
            minMarks,
            isSubQuestion,
            bonusMarks: bonusMarks || 0,
            marksDifference: marksDifference || 0,
            numberOfSubQuestions: numberOfSubQuestions || 0,
            compulsorySubQuestions: compulsorySubQuestions || 0,
        });

        // Save to the database
        await questionDefinition.save();

        return res.status(201).json({
            message: "Question definition created successfully.",
            data: questionDefinition,
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "An error occurred while creating the question definition." });
    }
};

const updateQuestionDefinition = async (req, res) => {
    const { id } = req.params;
    const {
        schemaId,
        questionsName,
        maxMarks,
        minMarks,
        isSubQuestion,
        bonusMarks,
        marksDifference,
        numberOfSubQuestions,
        compulsorySubQuestions,
    } = req.body;

    try {
        // Check if the question definition exists
        const existingQuestionDefinition = await QuestionDefinition.findById(id);
        if (!existingQuestionDefinition) {
            return res.status(404).json({ message: "Question definition not found." });
        }

        // Validate updated data
        const errorMessage = validateQuestionDefinition({
            schemaId,
            questionsName,
            maxMarks,
            minMarks,
            isSubQuestion,
            bonusMarks,
            marksDifference,
            numberOfSubQuestions,
            compulsorySubQuestions,
        });

        if (errorMessage) {
            console.log("ERROR  ", errorMessage)
            return res.status(400).json({ message: errorMessage });
        }

        // Check if the schemaId exists in the Schema collection
        const existingSchema = await Schema.findById(schemaId);

        if (!existingSchema) {
            return res.status(400).json({ message: "Invalid schemaId. Schema does not exist." });
        }


        // Update fields
        existingQuestionDefinition.schemaId = schemaId || existingQuestionDefinition.schemaId;
        existingQuestionDefinition.questionsName =
            questionsName || existingQuestionDefinition.questionsName;
        existingQuestionDefinition.maxMarks = maxMarks ?? existingQuestionDefinition.maxMarks;
        existingQuestionDefinition.minMarks = minMarks ?? existingQuestionDefinition.minMarks;
        existingQuestionDefinition.isSubQuestion =
            isSubQuestion ?? existingQuestionDefinition.isSubQuestion;
        existingQuestionDefinition.bonusMarks = bonusMarks ?? existingQuestionDefinition.bonusMarks;
        existingQuestionDefinition.marksDifference =
            marksDifference ?? existingQuestionDefinition.marksDifference;
        existingQuestionDefinition.numberOfSubQuestions =
            numberOfSubQuestions ?? existingQuestionDefinition.numberOfSubQuestions;
        existingQuestionDefinition.compulsorySubQuestions =
            compulsorySubQuestions ?? existingQuestionDefinition.compulsorySubQuestions;

        // Save the updated document
        const updatedQuestionDefinition = await existingQuestionDefinition.save();

        return res.status(200).json({
            message: "Question definition updated successfully.",
            data: updatedQuestionDefinition,
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "An error occurred while updating the question definition." });
    }
};

const removeQuestionDefinition = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the question definition exists
        const existingQuestionDefinition = await QuestionDefinition.findById(id);
        if (!existingQuestionDefinition) {
            return res.status(404).json({ message: "Question definition not found." });
        }

        // Remove the question definition
        await QuestionDefinition.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Question definition removed successfully.",
        });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "An error occurred while removing the question definition." });
    }
};

const removeQuestionDefinitionBasedOnSchemeId = async (req, res) => {
    const { schemaId } = req.params;

    try {
        // Validate if schemaId is provided
        if (!schemaId) {
            return res.status(400).json({ message: "schemaId is required." });
        }

        // Find and delete all question definitions associated with the schemaId
        const deletedCount = await QuestionDefinition.deleteMany({ schemaId });

        if (deletedCount.deletedCount === 0) {
            return res.status(404).json({
                message: "No question definitions found with the provided schemaId.",
            });
        }

        return res.status(200).json({
            message: `${deletedCount.deletedCount} question definitions removed successfully.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while removing question definitions.",
        });
    }
};

const getQuestionDefinitionById = async (req, res) => {
    const { id } = req.params; // ID of the question definition to retrieve

    try {
        // Fetch the question definition by ID
        const questionDefinition = await QuestionDefinition.findById(id);

        if (!questionDefinition) {
            return res.status(404).json({ message: "Question definition not found." });
        }

        return res.status(200).json({
            message: "Question definition retrieved successfully.",
            data: questionDefinition,
        });
    } catch (error) {
        console.error(error);

        // Handle invalid ObjectId format error
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid ID format." });
        }

        return res
            .status(500)
            .json({ message: "An error occurred while retrieving the question definition." });
    }
};

const getAllQuestionDefinitionBasedOnSchemeId = async (req, res) => {
    const { schemaId } = req.params;

    try {
        // Validate if schemaId is provided
        if (!schemaId) {
            return res.status(400).json({ message: "schemaId is required." });
        }

        // Find all question definitions associated with the schemaId
        const questionDefinitions = await QuestionDefinition.find({ schemaId });

        if (!questionDefinitions.length) {
            return res.status(404).json({
                message: "No question definitions found for the provided schemaId.",
            });
        }

        return res.status(200).json({
            message: "Question definitions retrieved successfully.",
            data: questionDefinitions,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while retrieving question definitions.",
        });
    }
};

export {
    createQuestionDefinition,
    updateQuestionDefinition,
    removeQuestionDefinition,
    removeQuestionDefinitionBasedOnSchemeId,
    getQuestionDefinitionById,
    getAllQuestionDefinitionBasedOnSchemeId
}

