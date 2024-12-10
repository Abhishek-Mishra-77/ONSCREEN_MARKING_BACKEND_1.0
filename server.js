import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import path from 'path';

import database from "./utils/database.js"
import createInitialUser from "./services/initialUserCreation.js";

import authRoutes from "./routes/authRoutes/authRoutes.js";
import classRoutes from "./routes/classRoutes/classRoute.js";
import subjectRoutes from "./routes/subjectRoutes/subjectRoute.js";
import schemaRoutes from "./routes/schemeRoutes/schemaRoutes.js";
import questionDefinitionRoutes from './routes/schemeRoutes/questionDefinitionRoutes.js';
import subjectQuestionRelationRoutes from "./routes/subjectSchemaRelationRoutes/subjectSchemaRelationRoutes.js";


/* -------------------------------------------------------------------------- */
/*                           SERVER CONFIGURATION                             */
/* -------------------------------------------------------------------------- */

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors())

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploadedPdfs')));



/* -------------------------------------------------------------------------- */
/*                           ROUTES ORIGIN                                    */
/* -------------------------------------------------------------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/schemas", schemaRoutes);
app.use("/api/schemas", questionDefinitionRoutes);
app.use("/api/subjects/relations", subjectQuestionRelationRoutes);


const PORT = process.env.PORT || 5000;

/* -------------------------------------------------------------------------- */
/*                           SERVER AND DATABASE SETUP                        */
/* -------------------------------------------------------------------------- */


app.listen(PORT, async () => {
    await database();
    await createInitialUser();
    console.log(`Server running on port ${PORT}`);
});

