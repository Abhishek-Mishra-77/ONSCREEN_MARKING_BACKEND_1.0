import express from "express";
const router = express.Router();

import { createSchema, updateSchema, getSchemaById, getAllSchemas, removeSchema } from "../../controllers/schemeControllers/schemaControllers.js";

router.post("/create/schema", createSchema);
router.put("/update/schema/:id", updateSchema);
router.get("/get/schema/:id", getSchemaById);
router.get("/getall/schema", getAllSchemas);
router.delete("/remove/schema/:id", removeSchema);


export default router;