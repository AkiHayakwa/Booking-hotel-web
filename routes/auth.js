var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let { RegisterValidator, validatedResult, ChangePasswordValidator } = require('../utils/validator')
let { CheckLogin } = require('../utils/authHandler')
let crypto = require('crypto')
let { sendMail, sendOtpMail } = require('../utils/sendMail')
let roleModel = require('../schemas/Role')
let userModel = require('../schemas/User')
let jwt = require('jsonwebtoken')
let bcrypt = require('bcrypt')
const { OAuth2Client } = require('google-auth-library')

let authController = require('../controllers/auth')
const GOOGLE_CLIENT_ID = '1013000990444-qr0dm8d2rq3vih6ihser20hq3ti9ifig.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Lưu OTP tạm trong bộ nhớ (Map)
// Key: email, Value: { otp, username, password, expiredAt }
const otpStore = new Map();

// Đăng nhập
router.post('/login', authController.login);

// Đăng nhập bằng Google
router.post('/google', async function (req, res, next) {
    try {
        let { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: "Thiếu credential Google" });
        }

        // Xác thực token từ Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Tìm user theo email
        let user = await userModel.findOne({ email: email.toLowerCase(), isDeleted: false }).populate('role');

        if (!user) {
            // Tạo tài khoản mới nếu chưa có
            let customerRole = await roleModel.findOne({ name: 'customer' });
            if (!customerRole) {
                return res.status(500).json({ message: "Lỗi hệ thống" });
            }

            // Tạo username từ email (phần trước @)
            let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            let username = baseUsername;
            let counter = 1;
            while (await userModel.findOne({ username: username })) {
                username = baseUsername + counter;
                counter++;
            }

            // Tạo password ngẫu nhiên (user dùng Google không cần nhớ)
            let randomPassword = crypto.randomBytes(16).toString('hex') + 'Aa1!';

            user = new userModel({
                username: username,
                password: randomPassword,
                email: email.toLowerCase(),
                fullName: name || '',
                avatar: picture || '',
                role: customerRole._id,
                googleId: googleId
            });
            await user.save();
            user = await userModel.findById(user._id).populate('role');
        }

        // Tạo JWT token
        let token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1d' });

        res.cookie("TOKEN_HOTEL", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: false
        });

        res.json({
            token: token, user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(401).json({ message: "Xác thực Google thất bại" });
    }
})

// STEP 1: Gửi OTP khi đăng ký
router.post('/send-otp', RegisterValidator, validatedResult, async function (req, res, next) {
    try {
        let { username, password, email } = req.body;
        email = email.toLowerCase();

        // Kiểm tra username đã tồn tại chưa
        let existingUser = await userModel.findOne({ username: username, isDeleted: false });
        if (existingUser) {
            return res.status(400).json({ message: "Tên đăng nhập đã được sử dụng" });
        }

        // Kiểm tra email đã tồn tại chưa
        let existingEmail = await userModel.findOne({ email: email, isDeleted: false });
        if (existingEmail) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }

        // Tạo mã OTP 6 số
        let otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Lưu vào bộ nhớ tạm (hết hạn 5 phút)
        otpStore.set(email, {
            otp: otpCode,
            username: username,
            password: password,
            expiredAt: Date.now() + 5 * 60 * 1000
        });

        // Tự động xóa sau 5 phút
        setTimeout(() => {
            otpStore.delete(email);
        }, 5 * 60 * 1000);

        // Gửi email OTP
        await sendOtpMail(email, otpCode);

        res.json({ message: "Mã OTP đã được gửi tới email của bạn", email: email });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: "Lỗi gửi mã OTP. Vui lòng thử lại." });
    }
})

// STEP 2: Xác nhận OTP và tạo tài khoản
router.post('/verify-otp', async function (req, res, next) {
    try {
        let { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mã OTP" });
        }

        email = email.toLowerCase();

        // Tìm OTP trong bộ nhớ
        let otpData = otpStore.get(email);

        if (!otpData) {
            return res.status(400).json({ message: "Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng đăng ký lại." });
        }

        // Kiểm tra hết hạn
        if (otpData.expiredAt < Date.now()) {
            otpStore.delete(email);
            return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng gửi lại." });
        }

        // Kiểm tra mã OTP
        if (otpData.otp !== otp) {
            return res.status(400).json({ message: "Mã OTP không đúng" });
        }

        // Lấy role customer mặc định
        let customerRole = await roleModel.findOne({ name: 'customer' });
        if (!customerRole) {
            return res.status(500).json({ message: "Lỗi hệ thống: Không tìm thấy vai trò mặc định" });
        }

        // Tạo tài khoản
        let newUser = await userController.CreateAnUser(
            otpData.username,
            otpData.password,
            email,
            customerRole._id
        );

        // Xóa OTP khỏi bộ nhớ
        otpStore.delete(email);

        res.json({ message: "Đăng ký thành công!", user: newUser });
    } catch (error) {
        console.error('Verify OTP error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại" });
        }
        res.status(500).json({ message: "Lỗi xác thực OTP. Vui lòng thử lại." });
    }
})

// Gửi lại OTP
router.post('/resend-otp', async function (req, res, next) {
    try {
        let { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Vui lòng cung cấp email" });
        }

        email = email.toLowerCase();

        // Tìm data đăng ký cũ
        let otpData = otpStore.get(email);
        if (!otpData) {
            return res.status(400).json({ message: "Không tìm thấy yêu cầu đăng ký. Vui lòng đăng ký lại." });
        }

        // Tạo mã OTP mới
        let otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Cập nhật
        otpData.otp = otpCode;
        otpData.expiredAt = Date.now() + 5 * 60 * 1000;
        otpStore.set(email, otpData);

        // Gửi email
        await sendOtpMail(email, otpCode);

        res.json({ message: "Mã OTP mới đã được gửi" });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: "Lỗi gửi lại mã OTP" });
    }
})

// Đăng ký tài khoản mới (sử dụng authController để xử lý cả phân quyền)
router.post('/register', RegisterValidator, validatedResult, authController.register);

// Lấy thông tin phiên đăng nhập
router.get('/me', CheckLogin, authController.getMe);
router.put('/me', CheckLogin, authController.updateMe);
router.delete('/me', CheckLogin, authController.deleteMe);
router.post('/changepassword', CheckLogin, ChangePasswordValidator, validatedResult, async function (req, res, next) {
    let { oldpassword, newpassword } = req.body;
    let user = req.user;
    let result = await userController.ChangePassword(user, oldpassword, newpassword);
    if (!result) {
        res.status(404).send("thong tin dang nhap khong dung")
    } else {
        res.send("doi thanh cong")
    }
})
router.post('/logout', CheckLogin, async function (req, res, next) {
    res.cookie("TOKEN_HOTEL", null, {
        maxAge: 0
    })
    res.send("logout")
})
// ======== QUÊN MẬT KHẨU (OTP) ========

// Bộ nhớ tạm cho forgot password OTP
const forgotOtpStore = new Map();

// STEP 1: Gửi OTP quên mật khẩu
router.post("/forgotpassword", async function (req, res, next) {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Vui lòng nhập email" });
        }

        email = email.toLowerCase();
        let user = await userModel.findOne({ email: email, isDeleted: false });
        if (!user) {
            return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
        }

        // Tạo OTP 6 số
        let otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Lưu vào bộ nhớ tạm
        forgotOtpStore.set(email, {
            otp: otpCode,
            userId: user._id,
            expiredAt: Date.now() + 5 * 60 * 1000,
            verified: false
        });

        // Tự động xóa sau 5 phút
        setTimeout(() => {
            forgotOtpStore.delete(email);
        }, 5 * 60 * 1000);

        // Gửi email OTP
        await sendOtpMail(email, otpCode);

        res.json({ message: "Mã OTP đã được gửi tới email của bạn", email: email });
    } catch (error) {
        console.error('Forgot password OTP error:', error);
        res.status(500).json({ message: "Lỗi gửi mã OTP. Vui lòng thử lại." });
    }
})

// STEP 2: Xác nhận OTP quên mật khẩu
router.post('/verify-forgot-otp', async function (req, res, next) {
    try {
        let { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        email = email.toLowerCase();
        let otpData = forgotOtpStore.get(email);

        if (!otpData) {
            return res.status(400).json({ message: "Mã OTP không tồn tại hoặc đã hết hạn" });
        }

        if (otpData.expiredAt < Date.now()) {
            forgotOtpStore.delete(email);
            return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng gửi lại." });
        }

        if (otpData.otp !== otp) {
            return res.status(400).json({ message: "Mã OTP không đúng" });
        }

        // Đánh dấu đã xác thực, cho phép đặt lại mật khẩu
        otpData.verified = true;
        forgotOtpStore.set(email, otpData);

        res.json({ message: "Xác thực OTP thành công", email: email });
    } catch (error) {
        console.error('Verify forgot OTP error:', error);
        res.status(500).json({ message: "Lỗi xác thực OTP" });
    }
})

// Gửi lại OTP quên mật khẩu
router.post('/resend-forgot-otp', async function (req, res, next) {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Vui lòng cung cấp email" });
        }

        email = email.toLowerCase();
        let otpData = forgotOtpStore.get(email);

        if (!otpData) {
            return res.status(400).json({ message: "Không tìm thấy yêu cầu. Vui lòng thực hiện lại." });
        }

        let otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        otpData.otp = otpCode;
        otpData.expiredAt = Date.now() + 5 * 60 * 1000;
        otpData.verified = false;
        forgotOtpStore.set(email, otpData);

        await sendOtpMail(email, otpCode);

        res.json({ message: "Mã OTP mới đã được gửi" });
    } catch (error) {
        console.error('Resend forgot OTP error:', error);
        res.status(500).json({ message: "Lỗi gửi lại mã OTP" });
    }
})

// STEP 3: Đặt lại mật khẩu (sau khi OTP đã verified)
router.post('/reset-password', async function (req, res, next) {
    try {
        let { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        email = email.toLowerCase();
        let otpData = forgotOtpStore.get(email);

        if (!otpData || !otpData.verified) {
            return res.status(400).json({ message: "Chưa xác thực OTP. Vui lòng thực hiện lại." });
        }

        let user = await userModel.findById(otpData.userId);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy tài khoản" });
        }

        user.password = newPassword;
        await user.save();

        // Xóa OTP
        forgotOtpStore.delete(email);

        res.json({ message: "Đặt lại mật khẩu thành công!" });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: "Lỗi đặt lại mật khẩu" });
    }
})

// Giữ lại route cũ cho tương thích
router.post('/resetpassword/:token', async function (req, res, next) {
    let { password } = req.body;
    let user = await userController.GetUserByToken(req.params.token);
    if (user) {
        user.password = password;
        user.forgotPasswordToken = null;
        user.forgotPasswordTokenExp = null;
        await user.save()
    }
    res.send("thanh cong")
})

module.exports = router;

