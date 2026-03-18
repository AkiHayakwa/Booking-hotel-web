var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
require('dotenv').config();

// Connect Database
var db = require('./utils/db');

var app = express();

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');
var roomTypesRouter = require('./routes/roomTypes');
var roomsRouter = require('./routes/rooms');
var bookingsRouter = require('./routes/bookings');
var paymentsRouter = require('./routes/payments');
var reviewsRouter = require('./routes/reviews');
var amenitiesRouter = require('./routes/amenities');
var promotionsRouter = require('./routes/promotions');
var blogsRouter = require('./routes/blogs');
var statsRouter = require('./routes/stats');

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/room-types', roomTypesRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/amenities', amenitiesRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/stats', statsRouter);

// Error handler
app.use(function(req, res, next) {
  res.status(404).json({ message: 'Route not found' });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
