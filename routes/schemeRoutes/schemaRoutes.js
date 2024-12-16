import express from "express";
const router = express.Router();

import { createSchema, updateSchema, getSchemaById, getAllSchemas, removeSchema, getAllCompletedSchema } from "../../controllers/schemeControllers/schemaControllers.js";

import authMiddleware from "../../Middlewares/authMiddleware.js";


/* -------------------------------------------------------------------------- */
/*                           SCHEMA ROUTES                                    */
/* -------------------------------------------------------------------------- */

router.post("/create/schema", authMiddleware, createSchema);
router.put("/update/schema/:id", authMiddleware, updateSchema);
router.get("/get/schema/:id", authMiddleware, getSchemaById);
router.get("/getall/schema", authMiddleware, getAllSchemas);
router.get("/getall/completed/schema", authMiddleware, getAllCompletedSchema);
router.delete("/remove/schema/:id", authMiddleware, removeSchema);


export default router;