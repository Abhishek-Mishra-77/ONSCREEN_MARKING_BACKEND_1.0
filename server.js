import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import bcrypt from "bcryptjs";
import path from 'path';

import database from "./utils/database.js"

import User from "./models/authModels/User.js"
import authRoutes from "./routes/authRoutes/authRoutes.js";
import classRoutes from "./routes/classRoutes/classRoute.js";
import subjectRoutes from "./routes/subjectRoutes/subjectRoute.js";
import schemaRoutes from "./routes/schemeRoutes/schemaRoutes.js";
import questionDefinitionRoutes from './routes/schemeRoutes/questionDefinitionRoutes.js';


/* -------------------------------------------------------------------------- */
/*                           SERVER CONFIGURATION                             */
/* -------------------------------------------------------------------------- */

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors())

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


/* -------------------------------------------------------------------------- */
/*                           ROUTES ORIGIN                                    */
/* -------------------------------------------------------------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/schemas", schemaRoutes);
app.use("/api/schemas", questionDefinitionRoutes);


const PORT = process.env.PORT || 5000;

/* -------------------------------------------------------------------------- */
/*                           SERVER AND DATABASE SETUP                        */
/* -------------------------------------------------------------------------- */


app.listen(PORT, async () => {
    await database();
    await createInitialUser();
    console.log(`Server running on port ${PORT}`);
});



/* -------------------------------------------------------------------------- */
/*                           FUNCTION TO CREATE INITIAL USER                  */
/* -------------------------------------------------------------------------- */
async function createInitialUser() {
    try {
        const existingUser = await User.findOne({ email: "abhishekomr077@gmail.com" });
        if (!existingUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("12345678", salt);
            const newUser = new User({
                name: "Abhishek Mishra",
                email: "abhishekomr077@gmail.com",
                password: hashedPassword,
                mobile: "8577887978",
                role: "admin",
                permissions: [
                    "Dashboard",
                    "Evaluator Dashboard",
                    "Classes",
                    "Courses",
                    "Course Detail",
                    "Profile",
                    "Users",
                    "Create User",
                    "Upload CSV File",
                    "Schema",
                    "Create Schema",
                    "Schema Structure"
                ]
            });

            await newUser.save();
            console.log("Initial admin user created");
        } else {
            console.log("Admin user already exists");
        }
    } catch (error) {
        console.error("Error creating user:", error);
    }
}