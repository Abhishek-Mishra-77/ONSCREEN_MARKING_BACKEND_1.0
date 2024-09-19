import Otp from '../../models/authModels/otp.js';
import User from '../../models/authModels/User.js';
import bcrypt from 'bcryptjs';
import sendOtpEmail from '../../services/otpService.js';
import jwt from "jsonwebtoken";


const createUser = async (req, res) => {
    const { name, email, password, mobile, role, permissions } = req.body;

    if (!name || !email || !password || !mobile || !role || !permissions) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            mobile,
            role,
            permissions
        });
        await newUser.save();

        await sendOtpEmail(email, otpCode);

        await Otp.create({
            user: newUser._id,
            otp: otpCode,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        res.status(201).json({ message: "User created successfully. Please verify your OTP." });
    } catch (error) {
        console.error("Error during user creation:", error);
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};

const userLogin = async (req, res) => {
    const { email, password, type } = req.body;


    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        if (password && type === 'password') {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.status(200).json({ message: "Login successful", token: token, userId: user._id });
        } else if (type === 'otp') {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: "User not found. Please sign up first." });
            }

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            await sendOtpEmail(email, otpCode);

            await Otp.create({
                user: user._id,
                otp: otpCode,
                expiresAt: Date.now() + 10 * 60 * 1000,
                otpAttempts: 0
            });

            res.status(200).json({ message: "OTP sent to your email.", userId: user._id });
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ message: "User ID and OTP are required" });
    }

    try {
        const otpRecord = await Otp.findOne({ user: userId, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (otpRecord.expiresAt < Date.now()) {
            await Otp.deleteOne({ user: userId, otp });
            await User.deleteOne({ _id: userId });
            return res.status(400).json({ message: "OTP has expired. User account deleted." });
        }

        if (otpRecord.attempts >= 3) {
            await Otp.deleteOne({ user: userId, otp });
            await User.deleteOne({ _id: userId });
            return res.status(400).json({ message: "Maximum attempts exceeded. User account deleted." });
        }

        if (otpRecord.otp === otp) {
            await Otp.deleteOne({ user: userId, otp });
            const user = await User.findById(userId);
            const token = jwt.sign(
                { userId: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            res.status(200).json({ message: "OTP verified successfully", token, user: user._id });
        } else {
            otpRecord.attempts += 1;
            await otpRecord.save();
            res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        res.status(500).json({ message: "Failed to verify OTP", error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ message: "Failed to reset password", error: error.message });
    }
}

const removeUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.deleteOne({ _id: id });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error during user deletion:", error);
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
}

const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
}


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
}

export { createUser, userLogin, verifyOtp, forgotPassword, removeUser, getUserById, getAllUsers };

