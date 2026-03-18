var express = require("express");
var router = express.Router();
let paymentController = require('../controllers/payments')
let { CheckLogin, checkRole } = require('../utils/authHandler')

router.get('/', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await paymentController.GetAllPayment();
    res.send(result)
})
router.get('/booking/:bookingId', CheckLogin, checkRole('admin', 'staff'), async function (req, res, next) {
    let result = await paymentController.GetPaymentByBooking(req.params.bookingId);
    if (!result) {
        res.status(404).send("khong tim thay thanh toan")
    } else {
        res.send(result)
    }
})
router.get('/:id', CheckLogin, checkRole('admin', 'staff'), async function (req, res, next) {
    let result = await paymentController.GetPaymentById(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay thanh toan")
    } else {
        res.send(result)
    }
})
router.post('/', CheckLogin, checkRole('admin', 'staff'), async function (req, res, next) {
    let { booking, amount, method } = req.body;
    let result = await paymentController.CreatePayment(booking, amount, method);
    res.send(result)
})

module.exports = router;
