import fs from "fs";
import path from "path";
import extractingBooklets from "./extractingBooklets.js";
import Subject from "../../models/classModel/subjectModel.js";
import { io } from "../../server.js";
import CourseSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import Schema from "../../models/schemeModel/schema.js";
import { PDFDocument } from "pdf-lib";
import { __dirname } from "../../server.js";

const processingBooklets = async (req, res) => {
    const { subjectCode } = req.body;

    if (!subjectCode) {
        return res.status(400).json({ message: "Subject code is required." });
    }

    try {
        const socketNamespace = io.of(`/processing-${subjectCode}`);
        socketNamespace.on("connection", async (socket) => {
            socket.emit("status", "Starting verification...");

            let schema;
            try {
                const subject = await Subject.findOne({ code: subjectCode });
                if (!subject) {
                    socket.emit("status", "Subject not found. Terminating process.");
                    socket.disconnect();
                    return;
                }

                const courseSchemaDetails = await CourseSchemaRelation.findOne({
                    subjectId: subject._id,
                });
                if (!courseSchemaDetails) {
                    socket.emit("status", "Schema not found for the subject. Terminating process.");
                    socket.disconnect();
                    return;
                }

                schema = await Schema.findOne({ _id: courseSchemaDetails.schemaId });
                if (!schema) {
                    socket.emit("status", "Schema details not found. Terminating process.");
                    socket.disconnect();
                    return;
                }

                socket.emit("status", "Verification completed. Processing PDFs...");
                await new Promise((resolve) => setTimeout(resolve, 3000));
            } catch (error) {
                console.error("Verification error:", error.message);
                socket.emit("error", "Verification failed. Terminating process.");
                socket.disconnect();
                return;
            }

            // Step 2: Process PDFs
            const scannedDataPath = path.join(__dirname, "scannedFolder", subjectCode);
            const processedFolderPath = path.join(__dirname, "processedFolder", subjectCode);
            const rejectedFolderPath = path.join(__dirname, "rejectedBookletsFolder", subjectCode);

            if (!fs.existsSync(scannedDataPath)) {
                socket.emit("status", "Scanned folder not found. Terminating process.");
                socket.disconnect();
                return;
            }

            // Ensure folders exist
            fs.mkdirSync(processedFolderPath, { recursive: true });
            fs.mkdirSync(rejectedFolderPath, { recursive: true });

            const pdfFiles = fs.readdirSync(scannedDataPath).filter(file => file.endsWith(".pdf"));

            if (pdfFiles.length === 0) {
                socket.emit("status", "No PDFs found in the scanned folder. Terminating process.");
                socket.disconnect();
                return;
            }

            // Track already processed files
            const processedFiles = fs.readdirSync(processedFolderPath).map(file => file.replace(".pdf", ""));
            const rejectedFiles = fs.readdirSync(rejectedFolderPath).map(file => file.replace(".pdf", ""));

            for (const pdfFile of pdfFiles) {
                const pdfPath = path.join(scannedDataPath, pdfFile);
                const pdfFileNameWithoutExt = path.basename(pdfFile, path.extname(pdfFile));

                // Skip processing if the PDF has already been processed or rejected
                if (processedFiles.includes(pdfFileNameWithoutExt)) {
                    socket.emit("status", `Skipping already processed PDF: ${pdfFile}`);
                    continue;
                }

                if (rejectedFiles.includes(pdfFileNameWithoutExt)) {
                    socket.emit("status", `Skipping already rejected PDF: ${pdfFile}`);
                    continue;
                }

                try {
                    const pdfBytes = fs.readFileSync(pdfPath);
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    const totalPages = pdfDoc.getPageCount();

                    // Send total pages info to frontend
                    if (totalPages === schema.numberOfPage) {
                        const processedPdfPath = path.join(processedFolderPath, pdfFile);
                        fs.copyFileSync(pdfPath, processedPdfPath);
                        socket.emit("status", `Processed: ${pdfFile} (Pages: ${totalPages})`);

                        // Extract images for processed PDFs
                        const outputDir = path.join(processedFolderPath, pdfFile.replace(".pdf", ""));
                        const imageCount = await extractingBooklets(pdfPath, outputDir);  // Use your existing function for extracting images

                        socket.emit("status", `Extracted ${imageCount} images from: ${pdfFile}`);
                    } else {
                        const rejectedPdfPath = path.join(rejectedFolderPath, pdfFile);
                        fs.mkdirSync(path.dirname(rejectedPdfPath), { recursive: true });
                        fs.copyFileSync(pdfPath, rejectedPdfPath);
                        socket.emit("status", `Rejected: ${pdfFile} (Pages: ${totalPages})`);
                    }
                } catch (error) {
                    console.error(`Error processing ${pdfFile}:`, error.message);
                    socket.emit("error", `Failed to process ${pdfFile}`);
                }
            }

            socket.emit("status", "Processing completed!");
            socket.disconnect();
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
