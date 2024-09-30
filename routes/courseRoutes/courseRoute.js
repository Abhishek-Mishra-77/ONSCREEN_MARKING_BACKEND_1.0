import express from "express";
const router = express.Router();

import authMiddleware from "../../Middlewares/authMiddleware.js";

import { createCourse, updateCourse, getAllCourses, getCourseById, removeCourse } from "../../controllers/courseControllers/courseController.js";

router.post("/create/course", authMiddleware, createCourse);
router.put("/update/course/:id", authMiddleware, updateCourse);
router.get("/get/courses", authMiddleware, getAllCourses);
router.get("/getbyid/course/:id", authMiddleware, getCourseById);
router.delete("/remove/course/:id", authMiddleware, removeCourse);

export default router;