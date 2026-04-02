// === Controller: Auth ===
const User = require('../schemas/User');
const Role = require('../schemas/Role');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
// Hàm đăng nhập: Kiểm tra email/mật khẩu và trả về token
module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Tìm người dùng bằng email hoặc username
    const user = await User.findOne({
      $or: [{ email: username.toLowerCase() }, { username: username }],
      isDeleted: false
    }).populate('role');

    if (!user) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    // 2. Kiểm tra mật khẩu (sử dụng bcrypt để so sánh mật khẩu đã mã hóa)
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác' });
    }

    // 3. Tạo JWT Token (Token dùng để định danh người dùng trong các yêu cầu sau)
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1d' });

    // 4. Trả về token cho Client
    res.json(token);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng nhập' });
  }
};

// GET /api/auth/me
// Hàm lấy thông tin cá nhân của người dùng đang đăng nhập
module.exports.getMe = async (req, res) => {
  try {
    // Thông tin người dùng đã được đính kèm vào req.user bởi middleware CheckLogin
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin cá nhân' });
  }
};

// PUT /api/auth/me
// Hàm cập nhật thông tin cá nhân của người dùng đang đăng nhập
module.exports.updateMe = async (req, res) => {
  try {
    const { fullName, phone, birthday, gender, address, avatarUrl, notificationSettings } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Các trường được phép cập nhật
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (birthday !== undefined) user.birthday = birthday;
    if (gender !== undefined) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (notificationSettings !== undefined) {
      user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
    }

    await user.save();

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        birthday: user.birthday,
        gender: user.gender,
        address: user.address,
        avatarUrl: user.avatarUrl,
        notificationSettings: user.notificationSettings
      }
    });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ message: 'Lỗi cập nhật thông tin cá nhân' });
  }
};

// POST /api/auth/register
module.exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone, roleName } = req.body;

    // 1. Tìm role tương ứng (mặc định là 'customer')
    const roleToFind = roleName || 'customer';
    const roleDoc = await Role.findOne({ name: roleToFind });
    if (!roleDoc) {
      return res.status(400).json({ message: 'Vai trò người dùng không hợp lệ' });
    }

    // 2. Kiểm tra xem username/email đã tồn tại chưa
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email: email.toLowerCase() }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username hoặc Email đã tồn tại' });
    }

    // 3. Tạo người dùng mới
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      password, // Password sẽ được hash bởi pre-save hook trong schema
      fullName,
      phone,
      role: roleDoc._id,
      status: true // Kích hoạt luôn cho dễ test
    });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: roleToFind
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký: ' + error.message });
  }
};

// POST /api/auth/logout
module.exports.logout = async (req, res) => {
  res.cookie('TOKEN_HOTEL', null, { maxAge: 0 });
  res.json({ message: 'Đăng xuất thành công' });
};

// DELETE /api/auth/me
module.exports.deleteMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    user.isDeleted = true;
    await user.save();

    res.cookie('TOKEN_HOTEL', null, { maxAge: 0 });
    res.json({ message: 'Tài khoản đã được xóa thành công' });
  } catch (error) {
    console.error('Delete me error:', error);
    res.status(500).json({ message: 'Lỗi khi xóa tài khoản' });
  }
};
