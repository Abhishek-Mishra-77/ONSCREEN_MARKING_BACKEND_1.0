import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subjectSchemaRelationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectSchemaRelation",
        required: true
    },
    folderPath: {
        type: String,
        required: true
    },
    totalFiles: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
});

const Task = mongoose.model("Task", taskSchema);

export default Task;