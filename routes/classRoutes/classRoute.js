import express from "express";
const router = express.Router();

import authMiddleware from "../../Middlewares/authMiddleware.js";

import { createCourse, updateCourse, getAllCourses, getCourseById, removeCourse } from "../../controllers/classControllers/classController.js";

router.post("/create/class", createCourse);
router.put("/update/classs/:id", updateCourse);
router.get("/get/class", getAllCourses);
router.get("/getbyid/class/:id", getCourseById);
router.delete("/remove/class/:id", removeCourse);

export default router;