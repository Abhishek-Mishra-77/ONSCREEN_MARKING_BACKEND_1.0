import mongoose from "mongoose";

const questionDefinitionSchema = new mongoose.Schema({
    schemaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schema",
        required: true,
    },
    questionsName: {
        type: String,
        required: true,
        enum: ["Number"], // Expand this enum as needed
    },
    maxMarks: {
        type: Number,
        required: true,
    },
    minMarks: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value <= this.maxMarks;
            },
            message: "Minimum marks must be less than or equal to maximum marks.",
        },
    },
    isSubQuestion: {
        type: Boolean,
        required: true,
        default: false,
    },
    bonusMarks: {
        type: Number,
        default: 0,
        validate: {
            validator: function (value) {
                // If there are no subquestions, bonusMarks is required and must be greater than 0
                return this.isSubQuestion || value > 0;
            },
            message: "Bonus marks must be greater than 0 when there are no subquestions.",
        },
    },
    marksDifference: {
        type: Number,
        required: function () {
            // marksDifference is required only when there are no subquestions
            return !this.isSubQuestion;
        },
        validate: {
            validator: function (value) {
                // Ensure marksDifference is valid when required
                return !this.isSubQuestion || value > 0;
            },
            message: "Marks difference is required and must be greater than 0 when there are no subquestions.",
        },
    },
    numberOfSubQuestions: {
        type: Number,
        default: 0,
        validate: {
            validator: function (value) {
                // numberOfSubQuestions must be greater than 0 if there are subquestions
                return !this.isSubQuestion || value > 0;
            },
            message: "Number of subquestions must be greater than 0 when there are subquestions.",
        },
    },
    compulsorySubQuestions: {
        type: Number,
        default: 0,
        validate: {
            validator: function (value) {
                // compulsorySubQuestions must be less than or equal to numberOfSubQuestions
                return (
                    !this.isSubQuestion ||
                    (value >= 0 && value <= this.numberOfSubQuestions)
                );
            },
            message:
                "Compulsory subquestions must be between 0 and the total number of subquestions when there are subquestions.",
        },
    },
});

const QuestionDefinition = mongoose.model(
    "QuestionDefinition",
    questionDefinitionSchema
);

export default QuestionDefinition;


