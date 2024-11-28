import SubQuestion from "../../models/schemeModel/subQuestions.js";
import QuestionDefinition from "../../models/schemeModel/questionDefinitionSchema.js";
import validateSubQuestionFields from "../../errorHanding/validateSubQuestionFields.js";

// Create a SubQuestion
const createSubQuestion = async (req, res) => {
    const { questionDefinitionId, maxMarks, minMarks, bonusMarks, marksDifference, questionsName } = req.body;

    try {

        // Validate the incoming data
        const validationResult = validateSubQuestionFields(req);
        if (!validationResult.valid) {
            return res.status(400).json({ message: validationResult.message });
        }

        // Check if the QuestionDefinition exists
        const questionDefinition = await QuestionDefinition.findById(questionDefinitionId);
        if (!questionDefinition) {
            return res.status(404).json({ message: "QuestionDefinition not found." });
        }

        // Create the new SubQuestion
        const newSubQuestion = new SubQuestion({
            questionDefinitionId,
            maxMarks,
            minMarks,
            bonusMarks,
            marksDifference,
            questionsName,
        });

        // Save the SubQuestion to the database
        await newSubQuestion.save();

        // Respond with the created SubQuestion
        return res.status(201).json({ message: "SubQuestion created successfully", data: newSubQuestion });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update a SubQuestion by ID
const updateSubQuestion = async (req, res) => {
    const { id } = req.params;
    const { maxMarks, minMarks, bonusMarks, marksDifference, questionsName } = req.body;

    // Validate the incoming data
    const validationResult = validateSubQuestionFields(req);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.message });
    }

    try {
        // Find the SubQuestion by ID
        const subQuestion = await SubQuestion.findById(id);
        if (!subQuestion) {
            return res.status(404).json({ message: "SubQuestion not found." });
        }

        // Update the SubQuestion fields
        subQuestion.maxMarks = maxMarks || subQuestion.maxMarks;
        subQuestion.minMarks = minMarks || subQuestion.minMarks;
        subQuestion.bonusMarks = bonusMarks || subQuestion.bonusMarks;
        subQuestion.marksDifference = marksDifference || subQuestion.marksDifference;
        subQuestion.questionsName = questionsName || subQuestion.questionsName;

        // Save the updated SubQuestion
        await subQuestion.save();

        // Respond with the updated SubQuestion
        return res.status(200).json({ message: "SubQuestion updated successfully", data: subQuestion });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Remove a SubQuestion by ID
const removeSubQuestionById = async (req, res) => {
    const { id } = req.params;

    try {
        // Find and remove the SubQuestion by ID
        const subQuestion = await SubQuestion.findByIdAndDelete(id);
        if (!subQuestion) {
            return res.status(404).json({ message: "SubQuestion not found." });
        }

        return res.status(200).json({ message: "SubQuestion deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Remove SubQuestions based on QuestionDefinitionId
const removeSubQuestionsBasedOnQuestionDefinitionId = async (req, res) => {
    const { questionDefinitionId } = req.params;

    try {
        const result = await SubQuestion.deleteMany({ questionDefinitionId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No SubQuestions found for the given questionDefinitionId." });
        }

        return res.status(200).json({ message: `${result.deletedCount} SubQuestions deleted successfully` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get a SubQuestion by ID
const getSubQuestionById = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the SubQuestion by ID
        const subQuestion = await SubQuestion.findById(id);
        if (!subQuestion) {
            return res.status(404).json({ message: "SubQuestion not found." });
        }

        return res.status(200).json({ data: subQuestion });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get all SubQuestions based on QuestionDefinitionId
const getAllSubQuestionsBasedOnQuestionDefinitionId = async (req, res) => {
    const { questionDefinitionId } = req.params;

    try {
        // Find all SubQuestions associated with the given QuestionDefinitionId
        const subQuestions = await SubQuestion.find({ questionDefinitionId });
        if (subQuestions.length === 0) {
            return res.status(404).json({ message: "No SubQuestions found for the given QuestionDefinitionId." });
        }

        return res.status(200).json({ data: subQuestions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export {
    createSubQuestion,
    updateSubQuestion,
    removeSubQuestionById,
    removeSubQuestionsBasedOnQuestionDefinitionId,
    getSubQuestionById,
    getAllSubQuestionsBasedOnQuestionDefinitionId,
};
