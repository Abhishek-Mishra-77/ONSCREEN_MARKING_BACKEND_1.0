import express from "express";
const router = express.Router();

import { createSchema, updateSchema, getSchemaById, getAllSchemas, removeSchema } from "../../controllers/schemeControllers/schemaControllers.js";

import authMiddleware from "../../Middlewares/authMiddleware.js";

router.post("/create/schema", authMiddleware, createSchema);
router.put("/update/schema/:id", authMiddleware, updateSchema);
router.get("/get/schema/:id", authMiddleware, getSchemaById);
router.get("/getall/schema", getAllSchemas);
router.delete("/remove/schema/:id", authMiddleware, removeSchema);


export default router;