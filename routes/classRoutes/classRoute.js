import express from "express";
const router = express.Router();

import authMiddleware from "../../Middlewares/authMiddleware.js";

import { createCourse, updateCourse, getAllCourses, getCourseById, removeCourse } from "../../controllers/classControllers/classController.js";


/* -------------------------------------------------------------------------- */
/*                           CLASS ROUTES                                     */
/* -------------------------------------------------------------------------- */

router.post("/create/class", authMiddleware, createCourse);
router.put("/update/classs/:id", authMiddleware, updateCourse);
router.get("/get/class", authMiddleware, getAllCourses);
router.get("/getbyid/class/:id", authMiddleware, getCourseById);
router.delete("/remove/class/:id", authMiddleware, removeCourse);

export default router;