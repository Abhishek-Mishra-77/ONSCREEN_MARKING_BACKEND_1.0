import fs from "fs";
import path from "path";
import Subject from "../../models/classModel/subjectModel.js";
import { io } from "../../server.js";
import CourseSchemaRelation from "../../models/subjectSchemaRelationModel/subjectSchemaRelationModel.js";
import Schema from "../../models/schemeModel/schema.js";
import { PDFDocument } from "pdf-lib";
import { __dirname } from "../../server.js";


const processingBookletsBySocket = async (req, res) => {
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

                try {
                    const pdfBytes = fs.readFileSync(pdfPath);
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    const totalPages = pdfDoc.getPageCount();

                    // Determine where to copy the file (processed or rejected)
                    let targetFolderPath;
                    let statusMessage;

                    if (totalPages === schema.numberOfPage) {
                        // For processed PDFs, ensure we overwrite the previous file in the processed folder
                        targetFolderPath = processedFolderPath;
                        statusMessage = `Processed: ${pdfFile} Pages: ${totalPages}`;
                    } else {
                        // For rejected PDFs, ensure we overwrite the previous file in the rejected folder
                        targetFolderPath = rejectedFolderPath;
                        statusMessage = `Rejected: ${pdfFile} Pages: ${totalPages}`;
                    }

                    // Ensure the target folder exists
                    fs.mkdirSync(targetFolderPath, { recursive: true });

                    // Build the target file path (this will overwrite if file already exists)
                    const targetFilePath = path.join(targetFolderPath, pdfFile);

                    // Copy the file (this will overwrite existing files)
                    fs.copyFileSync(pdfPath, targetFilePath);

                    // Emit status to frontend
                    socket.emit("status", statusMessage);

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

const servingBooklets = async (req, res) => {
    const { subjectCode, bookletName } = req.query;

    if (!subjectCode || !bookletName) {
        return res.status(400).json({ message: "Subject code and PDF name are required." });
    }

    // Construct the file path
    const pdfPath = path.join(__dirname, 'scannedFolder', subjectCode, bookletName);

    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ message: `PDF not found: ${bookletName}` });
    }

    // Set the response headers for PDF content
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${bookletName}"`);

    // Create a read stream and pipe it to the response to send the PDF file
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
        console.error('Error sending PDF file:', error);
        res.status(500).json({ message: "Failed to send PDF" });
    });
}

const removeRejectedBooklets = async (req, res) => {
    const { subjectCode } = req.query;

    if (!subjectCode) {
        return res.status(400).json({ message: "Subject code is required." });
    }

    try {
        // Define paths for the folders
        const scannedDataPath = path.join(__dirname, "scannedFolder", subjectCode);
        const rejectedFolderPath = path.join(__dirname, "rejectedBookletsFolder", subjectCode);

        // Check if the rejected folder exists for the given subject code
        if (!fs.existsSync(rejectedFolderPath)) {
            return res.status(404).json({ message: "Rejected folder not found." });
        }

        // Get the list of rejected booklets (PDFs)
        const rejectedFiles = fs.readdirSync(rejectedFolderPath).filter(file => file.endsWith(".pdf"));

        if (rejectedFiles.length === 0) {
            return res.status(404).json({ message: "No rejected booklets found." });
        }

        // Ensure the scanned folder exists
        if (!fs.existsSync(scannedDataPath)) {
            return res.status(404).json({ message: "Scanned folder not found." });
        }

        // Loop through each rejected file and remove it from both folders
        rejectedFiles.forEach((file) => {
            const rejectedFilePath = path.join(rejectedFolderPath, file);
            const scannedFilePath = path.join(scannedDataPath, file);

            // Remove the rejected file from the rejected folder
            if (fs.existsSync(rejectedFilePath)) {
                fs.unlinkSync(rejectedFilePath); // Remove rejected file
            }

            // Remove the rejected file from the scanned folder (if it exists there)
            if (fs.existsSync(scannedFilePath)) {
                fs.unlinkSync(scannedFilePath); // Remove scanned file
            }
        });

        // Send success response
        res.status(200).json({
            message: "Rejected booklets have been successfully removed from both folders."
        });

    } catch (error) {
        console.error("Error removing rejected booklets:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getAllBookletsName = async (req, res) => {
    const { subjectCode } = req.query;

    if (!subjectCode) {
        return res.status(400).json({ message: "Subject code is required." });
    }

    try {
        const scannedDataPath = path.join(__dirname, "scannedFolder", subjectCode);

        if (!fs.existsSync(scannedDataPath)) {
            return res.status(404).json({ message: "Scanned folder not found." });
        }

        const files = fs.readdirSync(scannedDataPath).filter(file => file.endsWith(".pdf"));

        if (files.length === 0) {
            return res.status(404).json({ message: "No booklets found." });
        }

        res.status(200).json({ message: "Booklets found", booklets: files });
    } catch (error) {
        console.error("Error fetching booklets:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


const processingBookletsManually = async (req, res) => {
    const { subjectCode, bookletName } = req.body;

    // Step 1: Validate the input
    if (!subjectCode || !bookletName) {
        return res.status(400).json({ message: "Subject code and booklet name are required." });
    }

    try {

        const subject = await Subject.findOne({ code: subjectCode });
        if (!subject) {
            return res.status(404).json({ message: "Subject not found (create subject)." });
        }

        const courseSchemaDetails = await CourseSchemaRelation.findOne({
            subjectId: subject._id,
        });

        if (!courseSchemaDetails) {
            return res.status(404).json({ message: "Schema not found for the subject (upload master answer and master question)." });
        }

        let schema = await Schema.findOne({ _id: courseSchemaDetails.schemaId });

        if (!schema) {
            return res.status(404).json({ message: "Schema not found." });
        }

        // Step 2: Set folder paths based on subjectCode
        const scannedDataPath = path.join(__dirname, 'scannedFolder', subjectCode);
        const processedFolderPath = path.join(__dirname, 'processedFolder', subjectCode);
        const rejectedFolderPath = path.join(__dirname, 'rejectedBookletsFolder', subjectCode);

        // Step 3: Verify that the scanned folder exists
        if (!fs.existsSync(scannedDataPath)) {
            return res.status(404).json({ message: "Scanned folder not found for the given subject code." });
        }

        // Step 4: Check if the specific booklet exists in the scanned folder
        const pdfPath = path.join(scannedDataPath, bookletName);
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ message: `Booklet ${bookletName} not found in the scanned folder.` });
        }

        // Step 5: Load and process the PDF
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const totalPages = pdfDoc.getPageCount();

        // Step 6: Define the expected number of pages (for example, we expect 10 pages)
        const expectedPages = 10; // You can replace this with the actual expected number of pages based on schema

        let status = '';

        // Step 7: Check if the PDF's page count matches the expected number of pages
        if (totalPages === expectedPages) {
            // If PDF is processed, move it to the processed folder
            const processedPdfPath = path.join(processedFolderPath, bookletName);
            fs.mkdirSync(path.dirname(processedPdfPath), { recursive: true });
            fs.copyFileSync(pdfPath, processedPdfPath);
            status = 'Processed';
        } else {
            // If PDF is rejected, move it to the rejected folder
            const rejectedPdfPath = path.join(rejectedFolderPath, bookletName);
            fs.mkdirSync(path.dirname(rejectedPdfPath), { recursive: true });
            fs.copyFileSync(pdfPath, rejectedPdfPath);
            status = 'Rejected';
        }

        // Step 8: Return the result to the client
        return res.status(200).json({
            message: `Processing completed for ${bookletName}.`,
            status,
            totalPages,
            pdfName: bookletName,
        });

    } catch (error) {
        console.error("Error processing booklet:", error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


export { processingBookletsBySocket, servingBooklets, removeRejectedBooklets, getAllBookletsName, processingBookletsManually };



// const processingBooklets = async (req, res) => {
//     const { subjectCode } = req.body;

//     if (!subjectCode) {
//         return res.status(400).json({ message: "Subject code is required." });
//     }

//     try {
//         const socketNamespace = io.of(`/processing-${subjectCode}`);
//         socketNamespace.on("connection", async (socket) => {
//             socket.emit("status", "Starting verification...");

//             let schema;
//             try {
//                 const subject = await Subject.findOne({ code: subjectCode });
//                 if (!subject) {
//                     socket.emit("status", "Subject not found. Terminating process.");
//                     socket.disconnect();
//                     return;
//                 }

//                 const courseSchemaDetails = await CourseSchemaRelation.findOne({
//                     subjectId: subject._id,
//                 });
//                 if (!courseSchemaDetails) {
//                     socket.emit("status", "Schema not found for the subject. Terminating process.");
//                     socket.disconnect();
//                     return;
//                 }

//                 schema = await Schema.findOne({ _id: courseSchemaDetails.schemaId });
//                 if (!schema) {
//                     socket.emit("status", "Schema details not found. Terminating process.");
//                     socket.disconnect();
//                     return;
//                 }

//                 socket.emit("status", "Verification completed. Processing PDFs...");
//                 await new Promise((resolve) => setTimeout(resolve, 3000));
//             } catch (error) {
//                 console.error("Verification error:", error.message);
//                 socket.emit("error", "Verification failed. Terminating process.");
//                 socket.disconnect();
//                 return;
//             }

//             // Step 2: Process PDFs
//             const scannedDataPath = path.join(__dirname, "scannedFolder", subjectCode);
//             const processedFolderPath = path.join(__dirname, "processedFolder", subjectCode);
//             const rejectedFolderPath = path.join(__dirname, "rejectedBookletsFolder", subjectCode);

//             if (!fs.existsSync(scannedDataPath)) {
//                 socket.emit("status", "Scanned folder not found. Terminating process.");
//                 socket.disconnect();
//                 return;
//             }

//             // Ensure folders exist
//             fs.mkdirSync(processedFolderPath, { recursive: true });
//             fs.mkdirSync(rejectedFolderPath, { recursive: true });

//             const pdfFiles = fs.readdirSync(scannedDataPath).filter(file => file.endsWith(".pdf"));

//             if (pdfFiles.length === 0) {
//                 socket.emit("status", "No PDFs found in the scanned folder. Terminating process.");
//                 socket.disconnect();
//                 return;
//             }

//             // Track already processed files
//             const processedFiles = fs.readdirSync(processedFolderPath).map(file => file.replace(".pdf", ""));
//             const rejectedFiles = fs.readdirSync(rejectedFolderPath).map(file => file.replace(".pdf", ""));

//             for (const pdfFile of pdfFiles) {
//                 const pdfPath = path.join(scannedDataPath, pdfFile);
//                 const pdfFileNameWithoutExt = path.basename(pdfFile, path.extname(pdfFile));

//                 // Skip processing if the PDF has already been processed or rejected
//                 if (processedFiles.includes(pdfFileNameWithoutExt)) {
//                     socket.emit("status", `Skipping already processed PDF: ${pdfFile}`);
//                     continue;
//                 }

//                 if (rejectedFiles.includes(pdfFileNameWithoutExt)) {
//                     socket.emit("status", `Skipping already rejected PDF: ${pdfFile}`);
//                     continue;
//                 }

//                 try {
//                     const pdfBytes = fs.readFileSync(pdfPath);
//                     const pdfDoc = await PDFDocument.load(pdfBytes);
//                     const totalPages = pdfDoc.getPageCount();

//                     // Send total pages info to frontend
//                     if (totalPages === schema.numberOfPage) {
//                         const processedPdfPath = path.join(processedFolderPath, pdfFile);
//                         fs.copyFileSync(pdfPath, processedPdfPath);
//                         socket.emit("status", `Processed: ${pdfFile} Pages: ${totalPages}`);
//                     } else {
//                         const rejectedPdfPath = path.join(rejectedFolderPath, pdfFile);
//                         fs.mkdirSync(path.dirname(rejectedPdfPath), { recursive: true });
//                         fs.copyFileSync(pdfPath, rejectedPdfPath);
//                         socket.emit("status", `Rejected: ${pdfFile} Pages: ${totalPages}`);
//                     }
//                 } catch (error) {
//                     console.error(`Error processing ${pdfFile}:`, error.message);
//                     socket.emit("error", `Failed to process ${pdfFile}`);
//                 }
//             }

//             socket.emit("status", "Processing completed!");
//             socket.disconnect();
//         });

//         res.status(200).json({
//             message: `Socket connection established for subjectCode: ${subjectCode}. Processing started.`,
//         });
//     } catch (error) {
//         console.error("Error processing booklets:", error.message);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };