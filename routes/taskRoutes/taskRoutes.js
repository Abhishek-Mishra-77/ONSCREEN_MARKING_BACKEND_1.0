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
router.put("/update/task/:id", updateAssignedTask);
router.delete("/remove/task/:id", removeAssignedTask);
router.get("/get/task/:id", getAssignTaskById);
router.get("/getall/tasks/:userId", getAllAssignedTaskByUserId);

export default router;