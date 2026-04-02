var express = require("express");
var router = express.Router();
let bookingController = require('../controllers/bookings')
let { CheckLogin, checkRole, checkHotelOwner } = require('../utils/authHandler')
let { CreateBookingValidator, validatedResult } = require('../utils/validator')

// Customer: xem booking cua minh
router.get('/my-bookings', CheckLogin, async function (req, res, next) {
    let result = await bookingController.GetMyBookings(req.user._id);
    res.send(result)
})
// Admin: xem tat ca booking
router.get('/', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await bookingController.GetAllBooking();
    res.send(result)
})
// Hotel Owner: xem booking cua hotel minh
router.get('/hotel/:hotelId', CheckLogin, checkRole('hotel_owner', 'admin'), checkHotelOwner, async function (req, res, next) {
    let result = await bookingController.GetBookingsByHotel(req.params.hotelId);
    res.send(result)
})
router.get('/:id', CheckLogin, async function (req, res, next) {
    let result = await bookingController.GetBookingById(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay booking")
    } else {
        res.send(result)
    }
})
// Customer: dat phong
router.post('/', CheckLogin, checkRole('customer'), CreateBookingValidator, validatedResult, async function (req, res, next) {
    try {
        let { hotel, rooms, checkInDate, checkOutDate, numberOfGuests, specialRequests, promotionId, discountAmount } = req.body;
        let result = await bookingController.CreateBooking(
            req.user._id, hotel, rooms, checkInDate, checkOutDate, numberOfGuests, specialRequests, promotionId, discountAmount
        );
        if (result.error) {
            return res.status(400).json({ message: result.error });
        }
        res.send(result);
    } catch (error) {
        next(error);
    }
})
// Hotel Owner: xac nhan booking
router.patch('/:id/confirm', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let result = await bookingController.ConfirmBooking(req.params.id);
    if (!result) {
        res.status(404).send("khong the xac nhan booking")
    } else {
        res.send(result)
    }
})
router.patch('/:id/check-in', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let result = await bookingController.CheckIn(req.params.id);
    if (!result) {
        res.status(404).send("khong the check-in")
    } else {
        res.send(result)
    }
})
router.patch('/:id/check-out', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let result = await bookingController.CheckOut(req.params.id);
    if (!result) {
        res.status(404).send("khong the check-out")
    } else {
        res.send(result)
    }
})
router.patch('/:id/cancel', CheckLogin, async function (req, res, next) {
    let result = await bookingController.CancelBooking(req.params.id);
    if (!result) {
        res.status(404).send("khong the huy booking")
    } else {
        res.send(result)
    }
})

module.exports = router;
