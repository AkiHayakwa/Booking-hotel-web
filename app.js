require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose')
let cors = require('cors')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/hotels', require('./routes/hotels'));
app.use('/api/v1/room-types', require('./routes/roomTypes'));
app.use('/api/v1/rooms', require('./routes/rooms'));
app.use('/api/v1/bookings', require('./routes/bookings'));
app.use('/api/v1/payments', require('./routes/payments'));
app.use('/api/v1/reviews', require('./routes/reviews'));
app.use('/api/v1/amenities', require('./routes/amenities'));
app.use('/api/v1/promotions', require('./routes/promotions'));
app.use('/api/v1/blogs', require('./routes/blogs'));
app.use('/api/v1/stats', require('./routes/stats'));
app.use('/api/v1/upload', require('./routes/upload'));

let roleModel = require('./schemas/Role')
let userModel = require('./schemas/User')

async function seedRoles() {
  let defaultRoles = [
    { name: 'admin', description: 'Quan tri vien he thong' },
    { name: 'hotel_owner', description: 'Chu so huu khach san' },
    { name: 'customer', description: 'Khach hang' }
  ];
  for (let role of defaultRoles) {
    let exists = await roleModel.findOne({ name: role.name });
    if (!exists) {
      await roleModel.create(role);
      console.log(`Created role: ${role.name}`);
    }
  }
  console.log('Roles seeded successfully');
}

async function seedAdmin() {
  // Tìm role admin
  const adminRole = await roleModel.findOne({ name: 'admin' });
  if (!adminRole) return;

  // Kiểm tra đã có admin chưa
  const exists = await userModel.findOne({ email: 'admin@luxstay.com' });
  if (exists) {
    console.log('Admin account already exists');
    return;
  }

  // Tạo tài khoản admin (password sẽ tự hash qua pre-save hook)
  await userModel.create({
    username: 'admin',
    email: 'admin@luxstay.com',
    password: 'Admin@123',
    fullName: 'Super Admin',
    phone: '+84 24 1234 5678',
    role: adminRole._id,
    status: true,   // kích hoạt luôn, không cần verify OTP
    loginCount: 0
  });

  console.log('========================================');
  console.log('✅ Admin account created!');
  console.log('   Email   : admin@luxstay.com');
  console.log('   Password: Admin@123');
  console.log('========================================');
}

mongoose.connect('mongodb://localhost:27017/hotel_booking');
mongoose.connection.on('connected', async () => {
  console.log("connected");
  await seedRoles();
  await seedAdmin();
})
mongoose.connection.on('disconnected', () => {
  console.log("disconnected");
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err.stack : {}
  });
});

module.exports = app;
