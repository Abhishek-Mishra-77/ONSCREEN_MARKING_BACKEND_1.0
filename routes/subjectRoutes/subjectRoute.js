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

/* -------------------------------------------------------------------------- */
/*                           SUBJECT ROUTES                                   */
/* -------------------------------------------------------------------------- */

router.post("/create/subject", authMiddleware, createSubject);
router.put("/update/subject/:id", authMiddleware, updateSubject);
router.delete("/remove/subject/:id", authMiddleware, removeSubject);
router.get("/getbyid/subject/:id", authMiddleware, getSubjectById);
router.get("/getall/subject", authMiddleware, getAllSubjects);
router.get("/getallsubjectbasedonclass/:classId", authMiddleware, getAllSubjectBasedOnClassId);

export default router;
