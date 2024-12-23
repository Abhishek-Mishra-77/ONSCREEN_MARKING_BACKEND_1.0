import mongoose from "mongoose";

const studentAnswerPdf = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    answerPdfName: {
        type: String,
        required: true
    }
});

const AnswerPdf = mongoose.model("AnswerPdf", studentAnswerPdf);

export default AnswerPdf;
