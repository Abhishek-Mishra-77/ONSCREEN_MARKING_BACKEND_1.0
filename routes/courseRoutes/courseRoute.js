import express from "express";
const router = express.Router();

import authMiddleware from "../../Middlewares/authMiddleware.js";

import { createCourse, updateCourse, getAllCourses, getCourseById, removeCourse } from "../../controllers/courseControllers/courseController.js";

router.post("/create/course", createCourse);
router.put("/update/course/:id", updateCourse);
router.get("/get/courses", getAllCourses);
router.get("/getbyid/course/:id", getCourseById);
router.delete("/remove/course/:id", removeCourse);

export default router;