import express from "express";
const router = express.Router();

import {
    createSubject,
    removeSubject,
    getSubjectById,
    getAllSubjects,
    updateSubject,
    getAllSubjectBasedOnClassId
} from "../../controllers/classControllers/subjectControllers.js";
import authMiddleware from "../../Middlewares/authMiddleware.js";


router.post("/create/subject", authMiddleware, createSubject);
router.delete("/remove/subject/:id", authMiddleware, removeSubject);
router.get("/getbyid/subject/:id", authMiddleware, getSubjectById);
router.get("/getall/subject", authMiddleware, getAllSubjects);
router.put("/update/subject/:id", authMiddleware, updateSubject);
router.get("/getallsubjectbasedonclass/:classId", authMiddleware, getAllSubjectBasedOnClassId);

export default router;