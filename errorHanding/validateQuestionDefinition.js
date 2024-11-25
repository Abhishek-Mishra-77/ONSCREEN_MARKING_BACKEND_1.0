export const validateQuestionDefinition = ({
    schemaId,
    questionsName,
    maxMarks,
    minMarks,
    isSubQuestion,
    bonusMarks,
    marksDifference,
    numberOfSubQuestions,
    compulsorySubQuestions,
}) => {
    if (!schemaId || !questionsName || maxMarks == null || minMarks == null) {
        return "Missing required fields: schemaId, questionsName, maxMarks, or minMarks.";
    }

    if (minMarks > maxMarks) {
        return "Minimum marks must be less than or equal to maximum marks.";
    }

    if (!isSubQuestion) {
        if (!marksDifference || marksDifference <= 0) {
            return "Marks difference is required and must be greater than 0 when there are no subquestions.";
        }
        if (bonusMarks <= 0) {
            return "Bonus marks must be greater than 0 when there are no subquestions.";
        }
    } else {
        if (numberOfSubQuestions <= 0) {
            return "Number of subquestions must be greater than 0 when there are subquestions.";
        }
        if (
            compulsorySubQuestions < 0 ||
            compulsorySubQuestions > numberOfSubQuestions
        ) {
            return "Compulsory subquestions must be between 0 and the total number of subquestions when there are subquestions.";
        }
    }

    return null; // No errors
};
