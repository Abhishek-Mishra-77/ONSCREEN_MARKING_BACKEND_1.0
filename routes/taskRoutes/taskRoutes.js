import express from "express";
const router = express.Router();

import {
    assigningTask,
    updateAssignedTask,
    removeAssignedTask,
    getAssignTaskById,
    getAllAssignedTaskByUserId
} from "../../controllers/taskControllers/taskControllers.js";

import authMiddleware from "../../Middlewares/authMiddleware.js";


/* -------------------------------------------------------------------------- */
/*                           TASK ROUTES                                      */
/* -------------------------------------------------------------------------- */

router.post("/create/task", assigningTask);
router.put("/update/task/:id", authMiddleware, updateAssignedTask);
router.delete("/remove/task/:id", authMiddleware, removeAssignedTask);
router.get("/get/task/:id", authMiddleware, getAssignTaskById);
router.get("/getall/tasks/:userId", authMiddleware, getAllAssignedTaskByUserId);

export default router;