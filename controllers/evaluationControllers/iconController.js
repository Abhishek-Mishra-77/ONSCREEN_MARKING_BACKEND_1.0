import Icon from "../../models/EvaluationModels/iconModel.js";
import Marks from "../../models/EvaluationModels/marksModel.js";
import mongoose from "mongoose";
import { isValidObjectId } from "../../services/mongoIdValidation.js";


const createIconHandler = async (req, res) => {
    const { answerPdfImageId, questionDefinitionId, iconUrl, question, timeStamps, size, x, y, width, height, mark } = req.body;
    try {
        if (!isValidObjectId(answerPdfImageId) || !isValidObjectId(questionDefinitionId)) {
            return res.status(400).json({ message: "Invalid answerPdfImageId or questionDefinitionId." });
        }

        if (!iconUrl || !question || !timeStamps || !size || !x || !y || !width || !height || !mark) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const icon = new Icon({ answerPdfImageId, questionDefinitionId, iconUrl, question, timeStamps, size, x, y, width, height, mark });

        if (!icon) {
            return res.status(400).json({ message: "Failed to create icon." });
        }

        const savedIcon = await icon.save();
        res.status(201).json(savedIcon);
    }
    catch (error) {
        console.error("Error creating icon:", error);
        res.status(500).json({ message: "Failed to create icon", error: error.message });
    }
};

const updateIconHandler = async (req, res) => {
    const { answerPdfImageId, questionDefinitionId, iconUrl, question, timeStamps, size, x, y, width, height, mark } = req.body;
    const { id } = req.params;

    try {
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid icon ID." });
        }
        if (!isValidObjectId(answerPdfImageId) || !isValidObjectId(questionDefinitionId)) {
            return res.status(400).json({ message: "Invalid answerPdfImageId or questionDefinitionId." });
        }

        if (!answerPdfImageId || !questionDefinitionId || !iconUrl || !question || !timeStamps || !size || !x || !y || !width || !height || !mark) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const updatedIcon = await Icon.findByIdAndUpdate(id, { answerPdfImageId, questionDefinitionId, iconUrl, question, timeStamps, size, x, y, width, height, mark }, { new: true });

        if (!updatedIcon) {
            return res.status(404).json({ message: "Icon not found." });
        }

        res.status(200).json(updatedIcon);
    } catch (error) {
        console.error("Error updating icon:", error);
        res.status(500).json({ message: "Failed to update icon", error: error.message });
    }
};
const removeIconByIdHandler = async (req, res) => {
    const { iconsId, answerPdfId } = req.query;

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        if (!isValidObjectId(iconsId)) {
            return res.status(400).json({ message: "Invalid icon ID." });
        }

        if (!isValidObjectId(answerPdfId)) {
            return res.status(400).json({ message: "Invalid answerPdfId." });
        }

        // Find and delete the icon
        const deletedIcon = await Icon.findByIdAndDelete(iconsId, { session });

        if (!deletedIcon) {
            return res.status(404).json({ message: "Icon not found." });
        }

        // Find marks associated with the answerPdfId and questionDefinitionId
        const marks = await Marks.findOne({ answerPdfId, questionDefinitionId: deletedIcon.questionDefinitionId }).session(session);

        if (!marks) {
            return res.status(404).json({ message: "Marks not found." });
        }

        // Deduct the mark associated with the deleted icon
        if (deletedIcon.mark) {
            marks.allottedMarks -= deletedIcon.mark;
            await marks.save({ session });
        }

        // Commit the transaction
        await session.commitTransaction();
        res.status(200).json({ message: "Icon deleted successfully." });
    } catch (error) {
        // Abort the transaction on error
        await session.abortTransaction();
        console.error("Error deleting icon:", error);
        res.status(500).json({ message: "Failed to delete icon", error: error.message });
    } finally {
        // End the session
        session.endSession();
    }
};


const removeAllAsscoiatedIcons = async (req, res) => {

};

const getIconsById = async (req, res) => { };

const getAllIconsByQuestionIdAndAnswerImageId = async (req, res) => { };

export {
    createIconHandler,
    updateIconHandler,
    removeIconByIdHandler,
    getIconsById,
    removeAllAsscoiatedIcons,
    getAllIconsByQuestionIdAndAnswerImageId
}
