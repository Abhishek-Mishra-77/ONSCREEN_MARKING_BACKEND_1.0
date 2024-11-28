const validateSubQuestionFields = (req) => {
    const { questionDefinitionId, maxMarks, minMarks, bonusMarks, marksDifference, questionsName } = req.body;

    if (!questionDefinitionId || !maxMarks || !marksDifference || !questionsName) {
        return {
            valid: false,
            message: "Missing required fields: questionDefinitionId, maxMarks, minMarks, marksDifference, and questionsName are required."
        };
    }

    if (Number(minMarks) > Number(maxMarks)) {
        return {
            valid: false,
            message: "Minimum marks must be less than or equal to maximum marks."
        };
    }

    if (Number(minMarks) < 0) {
        return {
            valid: false,
            message: "Minimum marks must be less greater than or equal to 0."
        };
    }

    if (bonusMarks !== undefined && Number(bonusMarks) > Number(maxMarks)) {
        return {
            valid: false,
            message: "Bonus marks cannot be greater than maximum marks."
        };
    }

    return { valid: true };
};

export default validateSubQuestionFields;
