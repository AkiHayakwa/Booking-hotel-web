var express = require("express");
var router = express.Router();
let bookingController = require('../controllers/bookings')
let { CheckLogin, checkRole } = require('../utils/authHandler')
let { CreateBookingValidator, validatedResult } = require('../utils/validator')

router.get('/my-bookings', CheckLogin, async function (req, res, next) {
    let result = await bookingController.GetMyBookings(req.user._id);
    res.send(result)
})
router.get('/', CheckLogin, checkRole('admin', 'staff'), async function (req, res, next) {
    let result = await bookingController.GetAllBooking();
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
router.post('/', CheckLogin, checkRole('customer'), CreateBookingValidator, validatedResult, async function (req, res, next) {
    let { room, checkInDate, checkOutDate, numberOfGuests, specialRequests, promotionId, discountAmount } = req.body;
    let result = await bookingController.CreateBooking(
        req.user._id, room, checkInDate, checkOutDate, numberOfGuests, specialRequests, promotionId, discountAmount
    );
    res.send(result)
})
router.patch('/:id/confirm', CheckLogin, checkRole('admin', 'staff'), async function (req, res, next) {
    let result = await bookingController.ConfirmBooking(req.params.id);
    if (!result) {
        res.status(404).send("khong the xac nhan booking")
    } else {
        res.send(result)
    }
})
router.patch('/:id/check-in', CheckLogin, checkRole('admin', 'staff'), async function (req, res, next) {
    let result = await bookingController.CheckIn(req.params.id);
    if (!result) {
        res.status(404).send("khong the check-in")
    } else {
        res.send(result)
    }
})
router.patch('/:id/check-out', CheckLogin, checkRole('admin', 'staff'), async function (req, res, next) {
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
