import chokidar from "chokidar";
import path from "path";
import subjectFolderCollection from "../../models/StudentModels/subjectFolderModel.js";
import { fileURLToPath } from "url";
import { io } from "../../server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const subjectFolderWatcher = () => {
    const scannedDataPath = path.join(__dirname, "scannedData");

    console.log("Watching folder for changes: ", scannedDataPath);

    // File watcher setup
    const watcher = chokidar.watch(scannedDataPath, {
        ignored: /(^|[\/\\])\../, // Ignore dotfiles
        persistent: true,
        depth: 3, // Ensure we are watching subfolders up to 3 levels deep
    });

    console.log(watcher + " WATCHER")

    // File addition event
    watcher.on("add", async (filePath) => {
        const parsedPath = path.parse(filePath);
        const folderName = parsedPath.dir.split(path.sep).pop();  // Get the folder name from path
        const fileName = parsedPath.base;  // Get file name from parsed path

        console.log(`File added: ${filePath}`);
        console.log(`Parsed Path: ${parsedPath.dir}, Folder Name: ${folderName}`);

        if (fileName.endsWith(".pdf")) {
            console.log(`PDF detected: ${filePath}`);

            // Extract student ID and subject code from the file name (format: studentId_subjectCode.pdf)
            const [studentId, subjectCode] = fileName.split("_");

            // Ensure folder name matches the subject code (without file extension)
            if (folderName === subjectCode.split(".")[0]) {
                console.log(`Folder name matches the subject code: ${folderName}`);

                try {
                    // Check if the folder exists in the database
                    const folder = await subjectFolderCollection.findOne({ folderName });

                    if (folder) {
                        // Folder exists, update the document
                        await subjectFolderCollection.updateOne(
                            { folderName },
                            {
                                $inc: { totalStudentPdfs: 1, unAllocated: 1 },  // Increment counts
                                $set: { updatedAt: new Date() }  // Set the updatedAt timestamp
                            }
                        );
                        console.log(`Database updated for folder: ${folderName}`);

                        // Emit a real-time update event to clients via Socket.IO
                        io.emit("folder-update", { folderName, fileName });
                    } else {
                        // Folder doesn't exist in the database, create a new entry
                        const newFolder = {
                            folderName,
                            totalStudentPdfs: 1,
                            description: "",
                            allocated: 0,
                            unAllocated: 1,
                            evaluated: 0,
                            evaluation_pending: 0,
                            totalAllocation: 0,
                        };
                        await subjectFolderCollection.insertOne(newFolder);
                        console.log(`New folder created in database: ${folderName}`);

                        // Emit a real-time add event to clients via Socket.IO
                        io.emit("folder-add", newFolder);
                    }
                } catch (error) {
                    console.error(`Error updating folder in database: ${error.message}`);
                }
            } else {
                console.log(`Folder name (${folderName}) doesn't match the subject code (${subjectCode})`);
            }
        }
    });

    // Folder addition event (new folder created in scannedData)
    watcher.on("addDir", async (folderPath) => {
        const folderName = path.basename(folderPath);
        console.log(`Folder detected: ${folderName}`);

        try {
            // Check if folder exists in the database
            const folderExists = await subjectFolderCollection.findOne({ folderName });

            if (!folderExists) {
                // Folder doesn't exist in the database, create a new entry
                const newFolder = {
                    folderName,
                    totalStudentPdfs: 0,
                    description: "",
                    allocated: 0,
                    unAllocated: 0,
                    evaluated: 0,
                    evaluation_pending: 0,
                    totalAllocation: 0,
                };
                await subjectFolderCollection.insertOne(newFolder);
                console.log(`New folder added to database: ${folderName}`);

                // Emit a real-time add event to clients via Socket.IO
                io.emit("folder-add", newFolder);
            }
        } catch (error) {
            console.error(`Error adding new folder to database: ${error.message}`);
        }
    });

    // Watcher is ready
    watcher.on("ready", () => {
        console.log("Watcher is ready for changes.");
    });
};

export { subjectFolderWatcher }