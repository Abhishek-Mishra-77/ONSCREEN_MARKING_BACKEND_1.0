import Icon from "../../models/EvaluationModels/iconModel.js";
import Marks from "../../models/EvaluationModels/marksModel.js";
import mongoose from "mongoose";
import { isValidObjectId } from "../../services/mongoIdValidation.js";
import AnswerPdfImage from "../../models/EvaluationModels/answerPdfImageModel.js";

const createIconHandler = async (req, res) => {
    const { answerPdfImageId, questionDefinitionId, iconUrl, question, timeStamps, x, y, width, height, mark } = req.body;

    console.log(answerPdfImageId, questionDefinitionId)

    try {
        if (!isValidObjectId(answerPdfImageId) || !isValidObjectId(questionDefinitionId)) {
            return res.status(400).json({ message: "Invalid answerPdfImageId or questionDefinitionId." });
        }

        if (!iconUrl || !question || !timeStamps || !x || !y || !width || !height || !mark) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const icon = new Icon({ answerPdfImageId, questionDefinitionId, iconUrl, question, timeStamps, x, y, width, height, mark });

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
    const { answerPdfImageId, questionDefinitionId, iconUrl, question, timeStamps, x, y, width, height, mark } = req.body;
    const { id } = req.params;

    try {
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid icon ID." });
        }
        if (!isValidObjectId(answerPdfImageId) || !isValidObjectId(questionDefinitionId)) {
            return res.status(400).json({ message: "Invalid answerPdfImageId or questionDefinitionId." });
        }

        if (!answerPdfImageId || !questionDefinitionId || !iconUrl || !question || !timeStamps || !x || !y || !width || !height || !mark) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const updatedIcon = await Icon.findByIdAndUpdate(id, { answerPdfImageId, questionDefinitionId, iconUrl, question, timeStamps, x, y, width, height, mark }, { new: true });

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
    const { answerPdfImageId, questionDefinitionId } = req.query;

    try {
        if (!isValidObjectId(answerPdfImageId) || !isValidObjectId(questionDefinitionId)) {
            return res.status(400).json({ message: "Invalid answerPdfImageId or questionDefinitionId." });
        }

        await Icon.deleteMany({ answerPdfImageId, questionDefinitionId });

        const answerPdfDetails = await AnswerPdfImage.findById(answerPdfImageId);

        if (!answerPdfDetails) {
            return res.status(404).json({ message: "AnswerPdfImage not found." });
        }

        const marks = await Marks.findOne({ answerPdfId: answerPdfDetails.answerPdfId, questionDefinitionId: questionDefinitionId });

        if (!marks) {
            return res.status(404).json({ message: "Marks not found." });
        }

        marks.allottedMarks = 0;
        marks.isMarked = false;

        await marks.save();

        res.status(200).json({ message: "Icons deleted successfully." });
    } catch (error) {
        console.error("Error deleting icons:", error);
        res.status(500).json({ message: "Failed to delete icons", error: error.message });
    }
};

const getIconsById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid icon ID." });
        }

        const icon = await Icon.findById(id);

        if (!icon) {
            return res.status(404).json({ message: "Icon not found." });
        }

        res.status(200).json(icon);
    } catch (error) {
        console.error("Error fetching icon:", error);
        res.status(500).json({ message: "Failed to fetch icon", error: error.message });
    }
};

const getAllIconsByQuestionIdAndAnswerImageId = async (req, res) => {
    const { questionDefinitionId, answerPdfImageId } = req.query;

    try {
        if (!isValidObjectId(questionDefinitionId) || !isValidObjectId(answerPdfImageId)) {
            return res.status(400).json({ message: "Invalid questionDefinitionId or answerPdfId." });
        }

        const icons = await Icon.find({ questionDefinitionId, answerPdfImageId });

        res.status(200).json(icons);
    } catch (error) {
        console.error("Error fetching icons:", error);
        res.status(500).json({ message: "Failed to fetch icons", error: error.message });
    }
};

export {
    createIconHandler,
    updateIconHandler,
    removeIconByIdHandler,
    getIconsById,
    removeAllAsscoiatedIcons,
    getAllIconsByQuestionIdAndAnswerImageId
}
