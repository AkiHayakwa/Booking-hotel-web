var express = require("express");
var router = express.Router();
let reviewController = require('../controllers/reviews')
let { CheckLogin, checkRole } = require('../utils/authHandler')
let { CreateReviewValidator, validatedResult } = require('../utils/validator')

// Customer: xem review cua minh
router.get('/my-reviews', CheckLogin, async function (req, res, next) {
    let result = await reviewController.GetMyReviews(req.user._id);
    res.send(result)
})
// Public: xem review theo hotel
router.get('/hotel/:hotelId', async function (req, res, next) {
    let result = await reviewController.GetReviewsByHotel(req.params.hotelId);
    if (!result) {
        res.status(400).send("loi khi lay danh gia")
    } else {
        res.send(result)
    }
})
// Customer: tao review
router.post('/', CheckLogin, checkRole('customer'), CreateReviewValidator, validatedResult, async function (req, res, next) {
    let { hotel, booking, rating, comment } = req.body;
    let result = await reviewController.CreateReview(req.user._id, hotel, booking, rating, comment);
    res.send(result)
})
// Admin: xoa review vi pham
router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await reviewController.DeleteReview(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay danh gia")
    } else {
        res.send(result)
    }
})

module.exports = router;
