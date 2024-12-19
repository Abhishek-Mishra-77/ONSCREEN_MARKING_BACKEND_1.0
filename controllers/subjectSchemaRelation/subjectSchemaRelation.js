import SubjectSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import Subject from "../../models/classModel/subjectModel.js";
import QuestionDefinition from "../../models/schemeModel/questionDefinitionSchema.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";
import CoordinateAllocation from "../../models/subjectSchemaRelationModel/coordinateAllocationModel.js";
import fs from 'fs';
import path from 'path';
import extractImagesFromPdf from "./extractingPdfImages.js";



/* -------------------------------------------------------------------------- */
/*                              CREATE SUBJECT SCHEMA RELATION                */
/* -------------------------------------------------------------------------- */
const createSubjectSchemaRelation = async (req, res) => {
    try {
        const { schemaId, subjectId, relationName } = req.body;

        if (!schemaId || !subjectId || !req.files.questionPdf || !req.files.answerPdf) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (!isValidObjectId(subjectId) || !isValidObjectId(schemaId)) {
            return res.status(400).json({ message: "Invalid subjectId or schemaId." });
        }

        if (!relationName) {
            return res.status(400).json({ message: "Relation name is required." });
        }

        const isValidSubject = await Subject.findOne({ _id: subjectId });

        if (!isValidSubject) {
            return res.status(404).json({ message: "Subject not found." });
        }

        const isValidSchema = await Schema.findOne({ _id: schemaId });

        if (!isValidSchema) {
            return res.status(404).json({ message: "Schema not found." });
        }

        const isRelationNameUnique = await SubjectSchemaRelation.findOne({ subjectId: subjectId, schemaId: schemaId, relationName: relationName });

        if (isRelationNameUnique) {
            return res.status(400).json({ message: "Relation name already exists." });
        }


        // Define base directories
        const baseDir = path.resolve(process.cwd(), 'uploadedPdfs');
        const questionPdfDir = path.join(baseDir, 'questionPdfs');
        const answerPdfDir = path.join(baseDir, 'answerPdfs');
        const extractedQuestionImageDir = path.join(baseDir, 'extractedQuestionPdfImages');
        const extractedAnswerImageDir = path.join(baseDir, 'extractedAnswerPdfImages');

        // Ensure base directories exist
        [questionPdfDir, answerPdfDir, extractedQuestionImageDir, extractedAnswerImageDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Move and rename PDF files
        const questionPdf = req.files.questionPdf[0];
        const answerPdf = req.files.answerPdf[0];
        const questionPdfPath = path.join(questionPdfDir, questionPdf.filename);
        const answerPdfPath = path.join(answerPdfDir, answerPdf.filename);

        fs.renameSync(questionPdf.path, questionPdfPath);
        fs.renameSync(answerPdf.path, answerPdfPath);

        // Extract images from PDFs into dynamically named directories
        const questionImageSubDir = path.join(extractedQuestionImageDir, `${path.basename(questionPdf.filename, '.pdf')}`);
        const answerImageSubDir = path.join(extractedAnswerImageDir, `${path.basename(answerPdf.filename, '.pdf')}`);

        if (!fs.existsSync(questionImageSubDir)) fs.mkdirSync(questionImageSubDir, { recursive: true });
        if (!fs.existsSync(answerImageSubDir)) fs.mkdirSync(answerImageSubDir, { recursive: true });

        const questionImageCount = await extractImagesFromPdf(questionPdfPath, questionImageSubDir);
        const answerImageCount = await extractImagesFromPdf(answerPdfPath, answerImageSubDir);

        // Save the new SubjectSchemaRelation
        const newSubjectSchemaRelation = new SubjectSchemaRelation({
            schemaId,
            subjectId,
            questionPdfPath: `${path.basename(questionPdf.filename, '.pdf')}`,
            answerPdfPath: `${path.basename(answerPdf.filename, '.pdf')}`,
            countOfQuestionImages: questionImageCount,
            countOfAnswerImages: answerImageCount,
            relationName: relationName,
            coordinateStatus: false
        });

        const savedSubjectSchemaRelation = await newSubjectSchemaRelation.save();

        res.status(201).json(savedSubjectSchemaRelation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the subject schema relation.' });
    }
};

/* -------------------------------------------------------------------------- */
/*                           GET SUBJECT SCHEMA RELATION                      */
/* -------------------------------------------------------------------------- */
const getSubjectSchemaRelationById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subject schema relation ID." });
        }

        const subjectSchemaRelation = await SubjectSchemaRelation.findById({ _id: id });

        if (!subjectSchemaRelation) {
            return res.status(404).json({ message: "Subject schema relation not found." });
        }

        res.status(200).json(subjectSchemaRelation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the subject schema relation.' });
    }
}


/* -------------------------------------------------------------------------- */
/*                           DELETE SUBJECT SCHEMA RELATION                   */
/* -------------------------------------------------------------------------- */
const deleteSubjectSchemaRelationById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid subject schema relation ID." });
        }


        // Find the SubjectSchemaRelation before deletion
        const subjectSchemaRelation = await SubjectSchemaRelation.findById({ _id: id });
        if (!subjectSchemaRelation) {
            return res.status(404).json({ message: "Subject schema relation not found." });
        }

        // Define base directories
        const baseDir = path.resolve(process.cwd(), 'uploadedPdfs');
        const questionPdfPath = path.join(baseDir, 'questionPdfs', `${subjectSchemaRelation.questionPdfPath}.pdf`);
        const answerPdfPath = path.join(baseDir, 'answerPdfs', `${subjectSchemaRelation.answerPdfPath}.pdf`);
        const extractedQuestionImageDir = path.join(baseDir, 'extractedQuestionPdfImages', subjectSchemaRelation.questionPdfPath);
        const extractedAnswerImageDir = path.join(baseDir, 'extractedAnswerPdfImages', subjectSchemaRelation.answerPdfPath);

        // Helper function to remove files or directories
        const removeFileOrDirectory = (filePath) => {
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filePath);
                }
            }
        };

        // Remove PDF files and extracted image directories
        removeFileOrDirectory(questionPdfPath);
        removeFileOrDirectory(answerPdfPath);
        removeFileOrDirectory(extractedQuestionImageDir);
        removeFileOrDirectory(extractedAnswerImageDir);

        // Delete the SubjectSchemaRelation from the database
        await SubjectSchemaRelation.findByIdAndDelete(id);

        res.status(200).json({ message: "Subject schema relation and associated files deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the subject schema relation.' });
    }
};

/* -------------------------------------------------------------------------- */
/*                           UPDATE SUBJECT SCHEMA RELATION                   */
/* -------------------------------------------------------------------------- */
const updateSubjectSchemaRelation = async (req, res) => {
    const { id } = req.params;
    try {
        const { schemaId, subjectId, relationName } = req.body;

        if (!schemaId || !subjectId || !relationName) {
            return res.status(400).json({ message: 'SchemaId , RelationName and SubjectId  are required.' });
        }

        if (!isValidObjectId(subjectId) || !isValidObjectId(schemaId)) {
            return res.status(400).json({ message: 'Invalid schemaId or subjectId.' });
        }

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'subject schema relation ID is invalid.' });
        }

        const subjectSchemaRelation = await SubjectSchemaRelation.findOne({ _id: id });

        if (!subjectSchemaRelation) {
            return res.status(404).json({ message: 'SubjectSchemaRelation not found.' });
        }


        const baseDir = path.resolve(process.cwd(), 'uploadedPdfs');
        const questionPdfDir = path.join(baseDir, 'questionPdfs');
        const answerPdfDir = path.join(baseDir, 'answerPdfs');
        const extractedQuestionImageDir = path.join(baseDir, 'extractedQuestionPdfImages');
        const extractedAnswerImageDir = path.join(baseDir, 'extractedAnswerPdfImages');

        let updatedFields = { relationName };

        // Handle Question PDF Replacement
        if (req.files.questionPdf) {
            const oldQuestionPdf = subjectSchemaRelation.questionPdfPath;
            const questionPdf = req.files.questionPdf[0];
            const questionPdfPath = path.join(questionPdfDir, questionPdf.filename);

            // Delete old PDF and its extracted images
            if (oldQuestionPdf) {
                const oldQuestionPdfPath = path.join(questionPdfDir, `${oldQuestionPdf}.pdf`);
                const oldQuestionImageDir = path.join(extractedQuestionImageDir, oldQuestionPdf);
                if (fs.existsSync(oldQuestionPdfPath)) fs.unlinkSync(oldQuestionPdfPath);
                if (fs.existsSync(oldQuestionImageDir)) fs.rmSync(oldQuestionImageDir, { recursive: true, force: true });
            }

            // Move and process new Question PDF
            fs.renameSync(questionPdf.path, questionPdfPath);
            const questionImageSubDir = path.join(extractedQuestionImageDir, path.basename(questionPdf.filename, '.pdf'));
            if (!fs.existsSync(questionImageSubDir)) fs.mkdirSync(questionImageSubDir, { recursive: true });
            const questionImageCount = await extractImagesFromPdf(questionPdfPath, questionImageSubDir);

            updatedFields.questionPdfPath = path.basename(questionPdf.filename, '.pdf');
            updatedFields.countOfQuestionImages = questionImageCount;
            updatedFields.relationName = relationName;
        }

        // Handle Answer PDF Replacement
        if (req.files.answerPdf) {
            const oldAnswerPdf = subjectSchemaRelation.answerPdfPath;
            const answerPdf = req.files.answerPdf[0];
            const answerPdfPath = path.join(answerPdfDir, answerPdf.filename);

            // Delete old PDF and its extracted images
            if (oldAnswerPdf) {
                const oldAnswerPdfPath = path.join(answerPdfDir, `${oldAnswerPdf}.pdf`);
                const oldAnswerImageDir = path.join(extractedAnswerImageDir, oldAnswerPdf);
                if (fs.existsSync(oldAnswerPdfPath)) fs.unlinkSync(oldAnswerPdfPath);
                if (fs.existsSync(oldAnswerImageDir)) fs.rmSync(oldAnswerImageDir, { recursive: true, force: true });
            }

            // Move and process new Answer PDF
            fs.renameSync(answerPdf.path, answerPdfPath);
            const answerImageSubDir = path.join(extractedAnswerImageDir, path.basename(answerPdf.filename, '.pdf'));
            if (!fs.existsSync(answerImageSubDir)) fs.mkdirSync(answerImageSubDir, { recursive: true });
            const answerImageCount = await extractImagesFromPdf(answerPdfPath, answerImageSubDir);

            updatedFields.answerPdfPath = path.basename(answerPdf.filename, '.pdf');
            updatedFields.countOfAnswerImages = answerImageCount;
            updatedFields.relationName = relationName;
        }

        // Update the database record
        const updatedSubjectSchemaRelation = await SubjectSchemaRelation.findByIdAndUpdate(
            subjectSchemaRelation._id,
            { $set: updatedFields },
            { new: true }
        );

        res.status(200).json(updatedSubjectSchemaRelation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the subject schema relation.' });
    }
};

/* -------------------------------------------------------------------------- */
/*                  UPDATE SUBJECT SCHEMA RELATION STATUS                     */
/* -------------------------------------------------------------------------- */

// const updateSubjectSchemaRelationStatus = async (req, res) => {
//     const { id } = req.params;
//     const { coordinateStatus } = req.body;

//     try {

//         if (!isValidObjectId(id)) {
//             return res.status(400).json({ message: 'subject schema relation ID is invalid.' });
//         }

//         const subjectSchemaRelation = await SubjectSchemaRelation.findById(id);

//         if (!subjectSchemaRelation) {
//             return res.status(404).json({ message: 'subject schema relation not found.' });
//         }

//         const questionDetails = await QuestionDefinition.find({ schemaId: subjectSchemaRelation.schemaId });

//         if (!questionDetails) {
//             return res.status(404).json({ message: 'Schema not found.' });
//         }

//         console.log(questionDetails)

//         const totalQuestions = questionDetails.totalQuestions;

//         const coordinateAllocations = await CoordinateAllocation.find({ courseSchemaRelationId: subjectSchemaRelation._id });

//         if (!coordinateAllocations) {
//             return res.status(404).json({ message: 'Coordinate Allocations not found.' });
//         }


//         if (coordinateAllocations.length < totalQuestions) {
//             return res.status(404).json({ message: ' Please complete all the coordinates.' });
//         }

//         return;

//         const updatedSubjectSchemaRelation = await SubjectSchemaRelation.findByIdAndUpdate(
//             id,
//             { $set: { coordinateStatus } },
//             { new: true }
//         );

//         res.status(200).json(updatedSubjectSchemaRelation); // Return the updated subject schema relation
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while updating the subject schema relation status.' });
//     }
// }

/* -------------------------------------------------------------------------- */
/*                           GET ALL SUBJECT SCHEMA RELATION                  */
/* -------------------------------------------------------------------------- */
const getAllSubjectSchemaRelationBySubjectId = async (req, res) => {
    const { subjectId } = req.params;
    try {

        if (!isValidObjectId(subjectId)) {
            return res.status(400).json({ message: "Invalid subject ID." });
        }

        const subjectSchemaRelations = await SubjectSchemaRelation.find({ subjectId: subjectId });
        if (!subjectSchemaRelations) {
            return res.status(404).json({ message: "Subject schema relations not found." });
        }

        res.status(200).json(subjectSchemaRelations);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the subject schema relations.' });
    }
}
/* -------------------------------------------------------------------------- */
/*                           GET ALL SUBJECT SCHEMA RELATION                  */
/* -------------------------------------------------------------------------- */

const getAllSubjectSchemaRelationBySchemaId = async (req, res) => {
    const { schemaId } = req.params;

    try {

        if (!isValidObjectId(schemaId)) {
            return res.status(400).json({ message: "Invalid schema ID." });
        }

        const subjectSchemaRelations = await SubjectSchemaRelation.find({ schemaId: schemaId });
        if (!subjectSchemaRelations) {
            return res.status(404).json({ message: "Subject schema relations not found." });
        }

        res.status(200).json(subjectSchemaRelations);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the subject schema relations.' });
    }
}
/* -------------------------------------------------------------------------- */
/*                           GET ALL SUBJECT SCHEMA RELATION                  */
/* -------------------------------------------------------------------------- */

const getAllSubjectSchemaRelationBySchemaIdAndSubjectId = async (req, res) => {
    const { schemaId, subjectId } = req.params;

    try {
        if (!schemaId || !subjectId) {
            return res.status(400).json({ message: "Invalid schema ID." });
        }

        if (!isValidObjectId(schemaId) || !isValidObjectId(subjectId)) {
            return res.status(400).json({ message: "Invalid schema ID." });
        }

        const subjectSchemaRelations = await SubjectSchemaRelation.find({ schemaId: schemaId, subjectId: subjectId });
        if (!subjectSchemaRelations) {
            return res.status(404).json({ message: "Subject schema relations not found." });
        }

        res.status(200).json(subjectSchemaRelations);

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving the subject schema relations.' });
    }

}

export {
    createSubjectSchemaRelation,
    getSubjectSchemaRelationById,
    deleteSubjectSchemaRelationById,
    updateSubjectSchemaRelation,
    getAllSubjectSchemaRelationBySubjectId,
    getAllSubjectSchemaRelationBySchemaId,
    getAllSubjectSchemaRelationBySchemaIdAndSubjectId,
}
