import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";


import database from "./utils/database.js";
import createInitialUser from "./services/initialUserCreation.js";

import authRoutes from "./routes/authRoutes/authRoutes.js";
import classRoutes from "./routes/classRoutes/classRoute.js";
import subjectRoutes from "./routes/subjectRoutes/subjectRoute.js";
import schemaRoutes from "./routes/schemeRoutes/schemaRoutes.js";
import questionDefinitionRoutes from "./routes/schemeRoutes/questionDefinitionRoutes.js";
import subjectQuestionRelationRoutes from "./routes/subjectSchemaRelationRoutes/subjectSchemaRelationRoutes.js";
import coordinateAllocation from "./routes/subjectSchemaRelationRoutes/coordinateAllocationRoutes.js";
import taskRoutes from "./routes/taskRoutes/taskRoutes.js";
import fileManagerRoutes from "./routes/filemanagerRoutes.js/fileManagerRoute.js";
/* -------------------------------------------------------------------------- */
/*                           SERVER CONFIGURATION                             */
/* -------------------------------------------------------------------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/uploadedPdfs', express.static(path.join(__dirname, 'uploadedPdfs')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/* -------------------------------------------------------------------------- */
/*                           ROUTES ORIGIN                                    */
/* -------------------------------------------------------------------------- */



app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/schemas", schemaRoutes);
app.use("/api/schemas", questionDefinitionRoutes);
app.use("/api/subjects/relations", subjectQuestionRelationRoutes);
app.use("/api/coordinates", coordinateAllocation);
app.use('/api/filemanager', fileManagerRoutes);
app.use("/api/tasks", taskRoutes);

/* -------------------------------------------------------------------------- */
/*                           SERVER AND DATABASE SETUP                        */
/* -------------------------------------------------------------------------- */

app.listen(PORT, async () => {
    try {
        await database();
        await createInitialUser();
        console.log(`Server running on http://localhost:${PORT}`);
    } catch (error) {
        console.error("Error starting server:", error);
    }
});
