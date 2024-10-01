import mongoose from "mongoose";

// Define the schema for each subject within a semester
const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        trim: true,
    }
});

// Define the schema for the academic session
const sessionSchema = new mongoose.Schema({
    sessionName: {
        type: String,
        required: true,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    }
});

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    courses: [subjectSchema],
    session: sessionSchema,
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Middleware to auto-update the `updatedAt` field before saving
courseSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
