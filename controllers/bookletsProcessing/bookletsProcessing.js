import fs from "fs";
import path from "path";
import extractImagesFromPdf from "../../services/extractImagesFromPdf.js";
import Subject from "../../models/classModel/subjectModel.js";
import { io } from "../../server.js";
import { __dirname } from "../../server.js";
import { isValidObjectId } from "../../services/mongoIdValidation.js";
import subjectFolderModel from "../../models/StudentModels/subjectFolderModel.js";
import CourseSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import Schema from "../../models/schemeModel/schema.js";

const processingBooklets = async (req, res) => {
    const { subjectCode } = req.body;

    if (!subjectCode) {
        return res.status(400).json({ message: "Subject code is required." });
    }

    try {
        const subject = await Subject.findOne({ code: subjectCode });

        if (!subject) {
            return res.status(404).json({ message: "Subject not found for the given subject code." });
        }

        const courseSchemaDetails = await CourseSchemaRelation.findOne({ subjectId: subject._id });

        if (!courseSchemaDetails) {
            return res.status(404).json({ message: "Schema not found for the given subject code." });
        }

        const schema = await Schema.findOne({ _id: courseSchemaDetails.schemaId });

        if (!schema) {
            return res.status(404).json({ message: "Schema not found for the given subject code." });
        }

        // Paths
        const scannedDataPath = path.join(__dirname, "scannedFolder", subjectCode);
        const processedFolderPath = path.join(__dirname, "processedFolder", subjectCode);

        // Ensure processedFolder exists
        if (!fs.existsSync(processedFolderPath)) {
            fs.mkdirSync(processedFolderPath, { recursive: true });
            console.log(`Created processed folder for subject: ${processedFolderPath}`);
        }

        if (!fs.existsSync(scannedDataPath)) {
            return res.status(404).json({ message: "Folder not found for the given subject code." });
        }

        // Start Socket.IO
        const socketNamespace = io.of(`/processing-${subjectCode}`);
        socketNamespace.on("connection", (socket) => {
            console.log(`Client connected to /processing-${subjectCode}`);
            socket.emit("status", `Processing started for subjectCode: ${subjectCode}`);

            // Read and process PDFs
            const files = fs.readdirSync(scannedDataPath).filter(file => file.endsWith(".pdf"));

            files.forEach(async (pdfFile) => {
                const pdfPath = path.join(scannedDataPath, pdfFile);
                const outputDir = path.join(processedFolderPath, pdfFile.replace(".pdf", ""), "extractedImages");

                try {
                    // Extract images
                    const imageCount = await extractImagesFromPdf(pdfPath, outputDir);
                    socket.emit("status", `Extracted ${imageCount} images from ${pdfFile}`);
                } catch (error) {
                    console.error(`Failed to extract images from ${pdfFile}: ${error.message}`);
                    socket.emit("error", `Failed to process ${pdfFile}`);
                }
            });

            socket.emit("status", "Processing completed!");
        });

        res.status(200).json({
            message: `Socket connection established for subjectCode: ${subjectCode}. Processing started.`,
        });
    } catch (error) {
        console.error("Error processing booklets:", error.message);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


export { processingBooklets };
