import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: true,
        trim: true,
    },
    subjectCode: {
        type: String,
        required: true,
        trim: true,
    }
});

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    courseName: {
        type: String,
        required: true,
        trim: true,
    },
    courseCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    subjects: [subjectSchema],
    duration: {
        type: Number,
        required: true,
    },
    sessionDuration: {
        type: Number,
        required: true,
        trim: true,
    },
    year: {
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
    },
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

courseSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
