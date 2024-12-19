import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

/* -------------------------------------------------------------------------- */
/*                           SCANNED FOLDER                                   */
/* -------------------------------------------------------------------------- */

// Get the directory name from `import.meta.url`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the main directory path
const baseDir = path.join(__dirname, '../..', 'scanned');

// Ensure the main directory exists
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
    console.log(`Created folder: ${baseDir}`);
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, baseDir); // Save files directly to the main directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
export const upload = multer({ storage: storage });

/* -------------------------------------------------------------------------- */
/*                           File Operations                                  */
/* -------------------------------------------------------------------------- */

// Create a new folder
const createFolder = async (req, res) => {
    const { path: folderPath = '', name } = req.body; // Default folderPath to an empty string
    console.log(path)
    if (!name) {
        return res.status(400).json({ error: 'Folder name is required.' });
    }

    try {
        const dirPath = path.join(baseDir, folderPath, name); // Safely join paths
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            return res.status(201).json({ success: true, message: 'Folder created successfully.' });
        }

        return res.status(400).json({ error: 'Folder already exists.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while creating the folder.' });
    }
};


// Get all files and folders in the main directory
const getAllFiles = (req, res) => {
    try {
        const requestedPath = req.body.path || ''; // Path from the request
        console.log(req.body.path)
        const fullPath = path.join(baseDir, requestedPath);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'Path not found.' });
        }

        // Function to retrieve directory structure
        const getDirectoryStructure = (dirPath) => {
            const items = fs.readdirSync(dirPath);
            return items.map((item) => {
                const itemPath = path.join(dirPath, item);
                const stats = fs.statSync(itemPath);
                return {
                    name: item, // Ensure name is not undefined
                    size: stats.isFile() ? stats.size : 0,
                    dateModified: stats.mtime,
                    isFile: stats.isFile(),
                    hasChild: stats.isDirectory() && fs.readdirSync(itemPath).length > 0,
                };
            });
        };

        // Fetch files and directories for the requested path
        const files = getDirectoryStructure(fullPath);

        // Respond with the current working directory and files
        res.status(200).json({
            cwd: {
                name: requestedPath || 'scanned',
                size: 0,
                dateModified: new Date(),
                isFile: false,
            },
            files: files,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while retrieving files.' });
    }
};


// Remove a file or folder from the main directory
const removeFile = async (req, res) => {
    const { name } = req.body; // Use `name` for file/folder to delete
    try {
        const targetPath = path.join(baseDir, name);
        if (fs.existsSync(targetPath)) {
            fs.rmSync(targetPath, { recursive: true, force: true });
            return res.status(200).json({ success: true, message: 'File or folder removed successfully.' });
        }

        return res.status(404).json({ error: 'File or folder not found.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while deleting the file or folder.' });
    }
};

// Rename a file or folder in the main directory
const renameFileOrFolder = async (req, res) => {
    const { currentName, newName } = req.body; // Use `currentName` and `newName`
    try {
        const oldPath = path.join(baseDir, currentName);
        const newPath = path.join(baseDir, newName);
        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            return res.status(200).json({ success: true, message: 'File or folder renamed successfully.' });
        }

        return res.status(404).json({ error: 'File or folder not found.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while renaming the file or folder.' });
    }
};

export {
    createFolder,
    getAllFiles,
    removeFile,
    renameFileOrFolder,
};
