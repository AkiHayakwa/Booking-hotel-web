var express = require("express");
var router = express.Router();
let statsController = require('../controllers/stats')
let { CheckLogin, checkRole } = require('../utils/authHandler')

router.get('/revenue', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let { month, year } = req.query;
    let result = await statsController.GetRevenue(month, year);
    if (!result) {
        res.status(400).send("loi khi lay thong ke")
    } else {
        res.send(result)
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
router.get('/occupancy', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await statsController.GetOccupancy();
    if (!result) {
        res.status(400).send("loi khi lay thong ke")
    } else {
        res.send(result)
    }
})

module.exports = router;
