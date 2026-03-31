var express = require("express");
var router = express.Router();
let statsController = require('../controllers/stats')
let { CheckLogin, checkRole, checkHotelOwner } = require('../utils/authHandler')

// Admin: thong ke toan he thong
router.get('/revenue', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let { month, year } = req.query;
    let result = await statsController.GetRevenue(month, year);
    if (!result) {
        res.status(400).send("loi khi lay thong ke")
    } else {
        res.send(result)
    }
})
router.get('/admin-overview', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await statsController.GetAdminDashboardStats();
    if (!result) {
        res.status(400).send("Lỗi khi lấy thống kê tổng quan");
    } else {
        res.send(result);
    }
})
router.get('/bookings', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await statsController.GetBookingStats();
    if (!result) {
        res.status(400).send("loi khi lay thong ke")
    } else {
        res.send(result)
    }
})
// Hotel Owner: thong ke theo hotel
router.get('/hotel/:hotelId/revenue', CheckLogin, checkRole('hotel_owner', 'admin'), checkHotelOwner, async function (req, res, next) {
    let { month, year } = req.query;
    let result = await statsController.GetRevenueByHotel(req.params.hotelId, month, year);
    if (!result) {
        res.status(400).send("loi khi lay thong ke")
    } else {
        res.send(result)
    }
})
router.get('/hotel/:hotelId/bookings', CheckLogin, checkRole('hotel_owner', 'admin'), checkHotelOwner, async function (req, res, next) {
    let result = await statsController.GetBookingStatsByHotel(req.params.hotelId);
    if (!result) {
        res.status(400).send("loi khi lay thong ke")
    } else {
        res.send(result)
    }
})
router.get('/hotel/:hotelId/occupancy', CheckLogin, checkRole('hotel_owner', 'admin'), checkHotelOwner, async function (req, res, next) {
    let result = await statsController.GetOccupancyByHotel(req.params.hotelId);
    if (!result) {
        res.status(400).send("loi khi lay thong ke")
    } else {
        res.send(result)
    }
})

module.exports = router;
