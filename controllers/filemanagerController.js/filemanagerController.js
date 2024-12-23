import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootFolder = path.join(__dirname, '..', '..', process.env.BASE_DIR);

// Ensure the root folder exists
fs.ensureDirSync(rootFolder);

export const listFiles = async (req, res) => {
    try {
        const { action, path: relativePath, name: newName } = req.body;
        const folderPath = path.join(rootFolder, relativePath || '/');

        if (!fs.existsSync(rootFolder)) {
            await fs.mkdir(rootFolder, { recursive: true });
            console.log(`${rootFolder} created successfully.`);
        }

        if (action === 'read') {
            // Read files logic
            const items = await fs.readdir(folderPath, { withFileTypes: true });
            const files = items.map((item) => {
                const filePath = path.join(folderPath, item.name);
                const stats = fs.statSync(filePath);
                return {
                    name: item.name,
                    size: item.isDirectory() ? 0 : stats.size,
                    dateModified: stats.mtime,
                    dateCreated: stats.birthtime,
                    hasChild: item.isDirectory(),
                    isFile: !item.isDirectory(),
                };
            });

            res.json({
                cwd: { name: path.basename(folderPath) || 'Scan Data' },
                files,
                error: null,
                details: null,
            });
        } else if (action === 'create') {
            if (!newName) {
                return res.status(400).json({ error: 'New folder name is required for create action.' });
            }

            const newFolderPath = path.join(folderPath, newName);
            await fs.mkdir(newFolderPath, { recursive: true });

            const currentDate = new Date();
            res.json({
                cwd: { name: path.basename(folderPath) || 'Scan Data', dateModified: currentDate.toISOString() },
                files: [{ name: newName, dateModified: currentDate.toISOString(), isFile: false }],
                error: null,
                details: null,
            });
        } else if (action === 'delete') {
            if (folderPath === rootFolder || folderPath.startsWith(rootFolder + '/restricted')) {
                return res.status(400).json({ error: 'Cannot delete the root folder or restricted folders' });
            }

            await fs.rm(folderPath, { recursive: true, force: true });
            res.json({ message: 'Folder deleted successfully' });
        } else {
            res.status(400).json({ error: 'Invalid action.' });
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
};


export const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ message: 'File uploaded successfully', file: req.file });
};

export const deleteFile = (req, res) => {
    const { name } = req.body;

    console.log(name + "WORKING OM FINE")

    if (!name) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const targetPath = path.join(rootFolder, name);

    fs.remove(targetPath, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: 'File/Folder deleted successfully' });
    });
};
