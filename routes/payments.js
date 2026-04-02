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

// === MOMO ROUTES ===
router.post('/momo', CheckLogin, async function (req, res, next) {
    let { bookingId, amount } = req.body;
    if (!bookingId || !amount) {
        return res.status(400).send({ message: "Thiếu tham số bookingId hoặc amount" });
    }
    let result = await paymentController.CreateMomoPayment(bookingId, amount);
    if (result.error) {
        return res.status(400).send({ message: result.error });
    }
    res.send(result); // Trả về payUrl và orderId
})

router.post('/momo-ipn', async function (req, res, next) {
    // Không bọc bằng CheckLogin vì kết nối này gọi từ server MoMo tới
    let response = await paymentController.VerifyMomoIPN(req.body);
    // MoMo yêu cầu IPN bắt buộc phải Request Success 204 NoContent, không cần body
    if (response) {
        return res.status(204).send();
    }
    return res.status(400).send();
})

module.exports = router;
