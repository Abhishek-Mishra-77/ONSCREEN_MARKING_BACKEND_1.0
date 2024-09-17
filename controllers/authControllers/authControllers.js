import Otp from '../../models/authModels/otp.js';
import User from '../../models/authModels/User.js';
import bcrypt from 'bcryptjs';
import sendOtpEmail from '../../services/otpService.js';
import jwt from "jsonwebtoken";


const createUser = async (req, res) => {
    const { name, email, password, mobile, role } = req.body;

    if (!name || !email || !password || !mobile || !role) {
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
            role
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
                { expiresIn: "1h" }
            );

            res.status(200).json({ message: "Login successful", token: token });
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
                { expiresIn: "1h" }
            );

            res.status(200).json({ message: "OTP verified successfully", token });
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

}

export { createUser, userLogin, verifyOtp };
