import mongoose from "mongoose";

const questionFileSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        trim: true,
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    images: [{ type: String }]
});

const QuestionFile = mongoose.model('QuestionFile', questionFileSchema);
export default QuestionFile;
