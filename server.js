import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import bcrypt from "bcryptjs";

import database from "./utils/database.js"

import User from "./models/authModels/User.js"
import authRoutes from "./routes/authRoutes/authRoutes.js";
import classRoutes from "./routes/classRoutes/classRoute.js";
import subjectRoutes from "./routes/subjectRoutes/subjectRoute.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors())


app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    await database();
    await createInitialUser();
    console.log(`Server running on port ${PORT}`);
});

// Function to create a user
async function createInitialUser() {
    try {
        // Check if a user with the provided email exists
        const existingUser = await User.findOne({ email: "abhishekomr07@gmail.com" });

        if (!existingUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("12345678", salt);
            const newUser = new User({
                name: "Abhishek Mishra",
                email: "abhishekomr07@gmail.com",
                password: hashedPassword,
                mobile: "8577887978",
                role: "admin",
                permissions: ["Main Dashboard", "Courses", "Course Detail", "Profile", "Users", "Create User", "Upload CSV File"]
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