import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/*                           SUBJECT SCHEMA RELATION                           */
/* -------------------------------------------------------------------------- */

const courseSchemaRelation = new mongoose.Schema({
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    schemaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schema",
        required: true,
    },

})