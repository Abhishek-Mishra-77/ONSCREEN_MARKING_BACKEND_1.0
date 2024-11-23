import mongoose from "mongoose";

const subQuestionSchema = new mongoose.Schema({
    questionDefinitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionDefinition",
        required: true,
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
    bonusMarks: {
        type: Number,
        default: 0,
        validate: {
            validator: function (value) {
                return value <= this.maxMarks;
            },
            message: "Bonus marks cannot be greater than maximum marks.",
        },
    },
    marksDifference: {
        type: Number,
        required: true,
    },
    questionsName: {
        type: String,
        required: true,
    },
});

const SubQuestion = mongoose.model("SubQuestion", subQuestionSchema);

export default SubQuestion;
