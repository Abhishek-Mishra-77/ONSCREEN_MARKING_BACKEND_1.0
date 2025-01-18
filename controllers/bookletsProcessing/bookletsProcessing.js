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

    try {

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

const bookletsVerification = async (req, res) => {
    const { subjectCode } = req.body;
    try {
        // Input validation
        if (!subjectCode) {
            return res.status(400).json({ message: "Subject code is required." });
        }

        // Subject verification
        const subject = await Subject.findOne({ code: subjectCode });
        if (!subject) {
            return res.status(404).json({ message: "Subject not found for the given subject code." });
        }

        // Course schema verification
        const courseSchemaDetails = await CourseSchemaRelation.findOne({ subjectId: subject._id });
        if (!courseSchemaDetails) {
            return res.status(404).json({ message: "Schema not found for the given subject code." });
        }

        // Schema verification
        const schema = await Schema.findOne({ _id: courseSchemaDetails.schemaId });
        if (!schema) {
            return res.status(404).json({ message: "Schema not found for the given subject code." });
        }

        // Paths for scanned and processed folders
        const scannedDataPath = path.join(__dirname, "scannedFolder", subjectCode);
        const processedFolderPath = path.join(__dirname, "processedFolder", subjectCode);

        // Ensure scannedDataPath exists
        if (!fs.existsSync(scannedDataPath)) {
            return res.status(404).json({ message: "Folder not found for the given subject code." });
        }

        // Create processed folder if it does not exist
        if (!fs.existsSync(processedFolderPath)) {
            fs.mkdirSync(processedFolderPath, { recursive: true });
            console.log(`Created processed folder for subject: ${processedFolderPath}`);
        }

        // Get all PDFs from scannedDataPath
        const pdfFiles = fs.readdirSync(scannedDataPath).filter(file => file.endsWith('.pdf'));

        if (pdfFiles.length === 0) {
            return res.status(404).json({ message: "No PDFs found in the scanned folder." });
        }

        // Process and copy PDFs to the processed folder
        pdfFiles.forEach(pdfFile => {
            const sourcePath = path.join(scannedDataPath, pdfFile);
            const destinationPath = path.join(processedFolderPath, pdfFile);

            // Copy or overwrite PDF in the processed folder
            fs.copyFileSync(sourcePath, destinationPath);
            console.log(`Processed file: ${pdfFile}`);
        });

        // Respond with the list of processed files
        res.status(200).json({
            message: "Booklet verification and PDF processing successful.",
            verified: true,
            processedFiles: pdfFiles,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

export { processingBooklets, bookletsVerification };

// import fs from "fs";
// import path from "path";
// import extractImagesFromPdf from "../../services/extractImagesFromPdf.js";
// import Subject from "../../models/classModel/subjectModel.js";
// import { io } from "../../server.js";
// import { __dirname } from "../../server.js";
// import { isValidObjectId } from "../../services/mongoIdValidation.js";
// import subjectFolderModel from "../../models/StudentModels/subjectFolderModel.js";
// import CourseSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
// import Schema from "../../models/schemeModel/schema.js";
// import { PDFDocument } from 'pdf-lib'; // For extracting PDF page count

// const processingBooklets = async (req, res) => {
//     const { subjectCode } = req.body;

//     if (!subjectCode) {
//         return res.status(400).json({ message: "Subject code is required." });
//     }

//     try {
//         const subject = await Subject.findOne({ code: subjectCode });

//         if (!subject) {
//             return res.status(404).json({ message: "Subject not found for the given subject code." });
//         }

//         const courseSchemaDetails = await CourseSchemaRelation.findOne({ subjectId: subject._id });

//         if (!courseSchemaDetails) {
//             return res.status(404).json({ message: "Schema not found for the given subject code." });
//         }

//         const schema = await Schema.findOne({ _id: courseSchemaDetails.schemaId });

//         if (!schema) {
//             return res.status(404).json({ message: "Schema not found for the given subject code." });
//         }

//         // Paths
//         const scannedDataPath = path.join(__dirname, "scannedFolder", subjectCode);
//         const processedFolderPath = path.join(__dirname, "processedFolder", subjectCode);

//         // Ensure processedFolder exists
//         if (!fs.existsSync(processedFolderPath)) {
//             fs.mkdirSync(processedFolderPath, { recursive: true });
//             console.log(`Created processed folder for subject: ${processedFolderPath}`);
//         }

//         if (!fs.existsSync(scannedDataPath)) {
//             return res.status(404).json({ message: "Folder not found for the given subject code." });
//         }

//         // Start Socket.IO
//         const socketNamespace = io.of(`/processing-${subjectCode}`);
//         socketNamespace.on("connection", (socket) => {
//             console.log(`Client connected to /processing-${subjectCode}`);
//             socket.emit("status", `Processing started for subjectCode: ${subjectCode}`);

//             // Read and process PDFs
//             const files = fs.readdirSync(scannedDataPath).filter(file => file.endsWith(".pdf"));

//             files.forEach(async (pdfFile) => {
//                 const pdfPath = path.join(scannedDataPath, pdfFile);
//                 const outputDir = path.join(processedFolderPath, pdfFile.replace(".pdf", ""), "extractedImages");

//                 try {
//                     // Extract number of pages in the PDF
//                     const pdfBytes = fs.readFileSync(pdfPath);
//                     const pdfDoc = await PDFDocument.load(pdfBytes);
//                     const totalPages = pdfDoc.getPageCount();
//                     const pageStatus = totalPages === schema.numberOfPage ? "OK" : "notOK";

//                     // Emit real-time updates about the PDF processing status
//                     socket.emit("status", `Processing ${pdfFile} - Pages: ${totalPages} - Status: ${pageStatus}`);

//                     // If total pages match, extract images
//                     if (totalPages === schema.numberOfPage) {
//                         const imageCount = await extractImagesFromPdf(pdfPath, outputDir);
//                         socket.emit("status", `Extracted ${imageCount} images from ${pdfFile}`);
//                     } else {
//                         socket.emit("status", `Skipping ${pdfFile} as it doesn't have ${schema.numberOfPage} pages`);
//                     }
//                 } catch (error) {
//                     console.error(`Failed to extract images from ${pdfFile}: ${error.message}`);
//                     socket.emit("error", `Failed to process ${pdfFile}`);
//                 }
//             });

//             socket.emit("status", "Processing completed!");
//         });

//         res.status(200).json({
//             message: `Socket connection established for subjectCode: ${subjectCode}. Processing started.`,
//         });
//     } catch (error) {
//         console.error("Error processing booklets:", error.message);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };

// export { processingBooklets };
