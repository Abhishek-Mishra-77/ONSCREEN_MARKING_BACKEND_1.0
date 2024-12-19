import express from 'express';
const router = express.Router();

import {
    createFolder,
    getAllFiles,
    removeFile,
    renameFileOrFolder,
    upload
} from "../../controllers/scannedControllers/ScannedControllers.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";

/* -------------------------------------------------------------------------- */
/*                           SCANNED ROUTES                                   */
/* -------------------------------------------------------------------------- */

// Folder creation (no file upload needed)
router.post("/create/scanned", createFolder);

// Rename a file or folder
router.put("/rename/scanned", renameFileOrFolder);

// Get all files or a specific directory's contents
router.post("/get/scanned", getAllFiles);

// Remove a file or folder
router.delete("/remove/scanned", removeFile);

// Upload files
router.post("/upload/scanned", upload.single('file'), (req, res) => {
    res.status(200).json({ success: true, message: 'File uploaded successfully.', file: req.file });
});

export default router;
