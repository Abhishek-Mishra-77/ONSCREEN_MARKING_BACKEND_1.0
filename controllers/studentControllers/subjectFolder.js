import chokidar from "chokidar";
import path from "path";
import fs from "fs"; // For folder operations
import SubjectFolderModel from "../../models/StudentModels/subjectFolderModel.js";
import { io } from "../../server.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const subjectFolderWatcher = () => {
    const scannedDataPath = path.join(__dirname, '..', '..', "scannedFolder");

    if (!fs.existsSync(scannedDataPath)) {
        console.log(`'scannedFolder' does not exist. Creating it at: ${scannedDataPath}`);
        fs.mkdirSync(scannedDataPath, { recursive: true });
    } else {
        console.log(`'scannedFolder' exists at: ${scannedDataPath}`);
    }

    console.log("Initializing watcher for scannedDataPath:", scannedDataPath);

    // File watcher setup
    const watcher = chokidar.watch(scannedDataPath, {
        ignored: /(^|[\/\\])\../, // Ignore dotfiles
        persistent: true,
        depth: 1, // Watch only the first level of subfolders
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

            // Use findOneAndUpdate to ensure uniqueness and atomicity
            const updatedFolder = await SubjectFolderModel.findOneAndUpdate(
                { folderName },
                {
                    $set: {
                        description: "new",
                        allocated: 0,
                        evaluated: 0,
                        evaluation_pending: 0,
                        totalAllocations: 0,
                        unAllocated: totalPdfs,
                        updatedAt: new Date(),
                    },
                    $setOnInsert: {
                        createdAt: new Date(),
                    },
                    totalStudentPdfs: totalPdfs,
                },
                { upsert: true, new: true }
            );

            // Emit real-time event to clients via Socket.IO
            io.emit(updatedFolder.isNew ? "folder-add" : "folder-update", updatedFolder);
        } catch (error) {
            console.error(`Error handling folder in database: ${error.message}`);
        }
    };

    // File addition event
    watcher.on("add", async (filePath) => {
        const parsedPath = path.parse(filePath);
        const folderName = parsedPath.dir.split(path.sep).pop();
        const fileName = parsedPath.base;

        // Only add PDFs from subfolders (not the root scannedFolder)
        if (fileName.endsWith(".pdf") && folderName !== "scannedFolder") {
            const folderPath = path.join(scannedDataPath, folderName);

            // Update or create the folder in the database
            await updateOrCreateFolderInDatabase(folderName, folderPath);
        }
    });

    // Folder addition event
    watcher.on("addDir", async (folderPath) => {
        const folderName = path.basename(folderPath); // Extract folder name

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

    // Watcher is ready
    watcher.on("ready", () => {
        console.log("Watcher is ready for changes.");
    });
};

export { subjectFolderWatcher };
