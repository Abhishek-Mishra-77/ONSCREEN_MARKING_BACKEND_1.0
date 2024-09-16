import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'abhishekomr07@gmail.com',
        pass: 'jxfh xiae vksm kpoa'
    }
});

const sendOtpEmail = async (email, otpCode) => {
    const mailOptions = {
        from: 'abhishekomr07@gmail.com',
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