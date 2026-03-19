const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

async function sendMail(toEmail, url) {
    let mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: toEmail,
        subject: 'Reset Password',
        html: `
            <h3>Yêu cầu đặt lại mật khẩu</h3>
            <p>Nhấn vào link bên dưới để đặt lại mật khẩu:</p>
            <a href="${url}">${url}</a>
            <p>Link này sẽ hết hạn sau 10 phút.</p>
        `
    };
    await transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
