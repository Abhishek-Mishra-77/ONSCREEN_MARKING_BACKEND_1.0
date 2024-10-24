import mongoose from "mongoose";

const schemaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    maxMarks: {
        type: Number,
        required: true,
    },
    minMarks: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
})

const Schema = mongoose.model('Schema', schemaSchema);
export default Schema