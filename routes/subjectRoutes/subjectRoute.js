import express from "express";
const router = express.Router();

import { createSubject, removeSubject, getSubjectById, getAllSubjects, updateSubject } from "../../controllers/classControllers/subjectControllers.js";

router.post("/create/subject", createSubject);
router.delete("/remove/subject/:id", removeSubject);
router.get("/getbyid/subject/:id", getSubjectById);
router.get("/getall/subject", getAllSubjects);
router.put("/update/subject/:id", updateSubject);

export default router;