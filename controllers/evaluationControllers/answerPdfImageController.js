import AnswerPdfImage from "../../models/EvaluationModels/answerPdfImageModel.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";

const getAnswerPdfImages = async (req, res) => {
    const { answerPdfId } = req.params;

    try {

        if (!isValidObjectId(answerPdfId)) {
            return res.status(400).json({ message: "Invalid answerPdfId." });
        }

        const answerPdfImages = await AnswerPdfImage.find({ answerPdfId });
        res.status(200).json(answerPdfImages);
    } catch (error) {
        console.error("Error fetching answerPdfImages:", error);
        res.status(500).json({ message: "Failed to fetch answerPdfImages", error: error.message });
    }
};

const updateAnswerPdfImageById = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid answerPdfImage ID." });
        }

        if (!status) {
            return res.status(400).json({ message: "Status is required." });
        }

        const answerPdfImage = await AnswerPdfImage.findOneAndUpdate({ _id: id }, { status }, { new: true });
        if (!answerPdfImage) {
            return res.status(404).json({ message: "AnswerPdfImage not found" });
        }
        res.status(200).json(answerPdfImage);
    } catch (error) {
        console.error("Error updating answerPdfImage:", error);
        res.status(500).json({ message: "Failed to update answerPdfImage", error: error.message });
    }
};



export { getAnswerPdfImages, updateAnswerPdfImageById }