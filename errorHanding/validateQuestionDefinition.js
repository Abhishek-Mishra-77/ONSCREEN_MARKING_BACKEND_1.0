export const validateQuestionDefinition = ({
    schemaId,
    questionsName,
    maxMarks,
    minMarks,
    parentQuestionId,
    bonusMarks,
    marksDifference,
    isSubQuestion,
    numberOfSubQuestions,
    compulsorySubQuestions,
}) => {
    if (!schemaId || !questionsName || maxMarks == null || minMarks == null) {
        return "Missing required fields: schemaId, questionsName, maxMarks, or minMarks.";
    }

    if (Number(minMarks) > Number(maxMarks)) {
        return "Minimum marks must be less than or equal to maximum marks.";
    }

    if (isSubQuestion) {
        if (!parentQuestionId) {
            return "Subquestions require a parentQuestionId.";
        }

        if (Number(numberOfSubQuestions) < 0 || Number(compulsorySubQuestions) < 0) {
            return "Subquestions cannot have numberOfSubQuestions or compulsorySubQuestions defined.";
        }
    } else {
        if (!marksDifference || isNaN(Number(marksDifference)) || Number(marksDifference) <= 0) {
            return "Marks difference is required and must be a positive number for parent questions.";
        }

        if (Number(bonusMarks) < 0) {
            return "Bonus marks cannot be negative.";
        }

        if (Number(numberOfSubQuestions) <= 0) {
            return "Number of subquestions must be greater than 0 for parent questions.";
        }

        if (
            Number(compulsorySubQuestions) < 0 ||
            Number(compulsorySubQuestions) > Number(numberOfSubQuestions)
        ) {
            return "Compulsory subquestions must be between 0 and the total number of subquestions for parent questions.";
        }
    }

    return null;
};
