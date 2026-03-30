const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER || "88d47c3ddf69f8",
        pass: process.env.MAILTRAP_PASS || "8a6da019d67a19"
    }
});

async function sendMail(toEmail, url) {
    let mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: toEmail,
        subject: 'Reset Password - LuxStay Booking',
        html: `
            <h3>Yêu cầu đặt lại mật khẩu</h3>
            <p>Nhấn vào link bên dưới để đặt lại mật khẩu:</p>
            <a href="${url}">${url}</a>
            <p>Link này sẽ hết hạn sau 10 phút.</p>
        `
    };
    await transporter.sendMail(mailOptions);
}

async function sendOtpMail(toEmail, otpCode) {
    let mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: toEmail,
        subject: 'Mã xác nhận đăng ký - LuxStay Booking',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f5f7f8; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <h2 style="color: #001f3d; margin: 0;">LuxStay Booking</h2>
                </div>
                <div style="background: white; border-radius: 8px; padding: 32px; text-align: center;">
                    <h3 style="color: #001f3d; margin-bottom: 8px;">Mã xác nhận đăng ký</h3>
                    <p style="color: #64748b; margin-bottom: 24px;">Vui lòng sử dụng mã OTP bên dưới để hoàn tất đăng ký tài khoản:</p>
                    <div style="background: #001f3d; color: #d4af37; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 24px; border-radius: 8px; display: inline-block;">
                        ${otpCode}
                    </div>
                    <p style="color: #94a3b8; margin-top: 24px; font-size: 14px;">Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>
                    <p style="color: #94a3b8; font-size: 13px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
                </div>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
}

module.exports = { sendMail, sendOtpMail };
