import chokidar from "chokidar";
import path from "path";
import fs from "fs";
import SubjectFolderModel from "../../models/StudentModels/subjectFolderModel.js";
import { io } from "../../server.js";
import { __dirname } from "../../server.js";

const subjectFolderWatcher = () => {
    const scannedDataPath = path.join(__dirname, "scannedFolder");

    if (!fs.existsSync(scannedDataPath)) {
        console.log(`'scannedFolder' does not exist. Creating it at: ${scannedDataPath}`);
        fs.mkdirSync(scannedDataPath, { recursive: true });
    } else {
        console.log(`'scannedFolder' exists at: ${scannedDataPath}`);
    }

    // File watcher setup
    const watcher = chokidar.watch(scannedDataPath, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        depth: 1,
    });

    // Helper function to count PDFs in a folder
    const countPdfsInFolder = (folderPath) => {
        const files = fs.readdirSync(folderPath);
        return files.filter(file => file.endsWith(".pdf")).length;
    };

    // Function to handle folder updates or creation
    const updateOrCreateFolderInDatabase = async (folderName, folderPath) => {
        try {
            const totalPdfs = countPdfsInFolder(folderPath);

            // If there are no PDFs, don't create or update the folder in the database
            if (totalPdfs === 0) {
                console.log(`No PDFs found in folder: ${folderName}. Skipping database update.`);
                return;
            }

            // Check if the folder already exists
            const existingFolder = await SubjectFolderModel.findOne({ folderName });

            let unAllocated = totalPdfs;
            if (existingFolder) {
                // Calculate the new unAllocated value
                unAllocated = totalPdfs - existingFolder.totalStudentPdfs + existingFolder.unAllocated;
                unAllocated = Math.max(unAllocated, 0); // Ensure unAllocated doesn't go negative
            }

            // Use findOneAndUpdate to ensure uniqueness and atomicity
            const updatedFolder = await SubjectFolderModel.findOneAndUpdate(
                { folderName },
                {
                    $set: {
                        totalStudentPdfs: totalPdfs,
                        unAllocated: unAllocated,
                        updatedAt: new Date(),
                    },
                    $setOnInsert: {
                        description: "new",
                        allocated: 0,
                        evaluated: 0,
                        evaluation_pending: 0,
                        totalAllocations: 0,
                        createdAt: new Date(),
                    },
                },
                { upsert: true, new: true }
            );

            // Emit the updated data to clients
            io.emit(existingFolder ? "folder-update" : "folder-add", updatedFolder);
        } catch (error) {
            console.error(`Error handling folder in database: ${error.message}`);
        }
    };



    // Send the current state of folders to the frontend on connection
    io.on("connection", async (socket) => {
        console.log("A client connected:", socket.id);
        try {
            const folders = await SubjectFolderModel.find();
            socket.emit("folder-list", folders);
        } catch (error) {
            console.error(`Error fetching folder list: ${error.message}`);
        }

        socket.on("disconnect", () => {
            console.log("A client disconnected:", socket.id);
        });
    });

    // File addition event
    watcher.on("add", async (filePath) => {
        const parsedPath = path.parse(filePath);
        const folderName = parsedPath.dir.split(path.sep).pop();
        const fileName = parsedPath.base;

        if (fileName.endsWith(".pdf") && folderName !== "scannedFolder") {
            const folderPath = path.join(scannedDataPath, folderName);

            // Update or create the folder in the database
            await updateOrCreateFolderInDatabase(folderName, folderPath);
        }
    });

    // Folder addition event
    watcher.on("addDir", async (folderPath) => {
        const folderName = path.basename(folderPath);

        // Skip the root 'scannedFolder' itself
        if (folderName !== "scannedFolder") {
            const folderFiles = fs.readdirSync(folderPath);

            // Check if the folder contains PDF files and not subfolders
            const hasPdfFiles = folderFiles.some(file => file.endsWith(".pdf"));

            // Only track folders containing PDFs
            if (hasPdfFiles) {
                await updateOrCreateFolderInDatabase(folderName, folderPath);
            } else {
                console.log(`Folder ${folderName} contains no PDFs or only subfolders. Skipping database update.`);
            }
        }
    });

    // Folder removal event
    watcher.on("unlinkDir", async (folderPath) => {
        const folderName = path.basename(folderPath);

        if (folderName !== "scannedFolder") {
            await removeFolderFromDatabase(folderName);
        }
    });

    // Watcher is ready
    watcher.on("ready", () => {
        console.log("Watcher is ready for changes.");
    });
};

export { subjectFolderWatcher };
