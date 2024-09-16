import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTHMAIL,
        pass: process.env.AUTHPASSWORD
    }
});

const sendOtpEmail = async (email, otpCode) => {
    const mailOptions = {
        from: process.env.AUTHMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otpCode}.`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
};

export default sendOtpEmail;