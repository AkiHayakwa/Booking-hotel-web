var express = require("express");
var router = express.Router();
let reviewController = require('../controllers/reviews')
let { CheckLogin, checkRole } = require('../utils/authHandler')
let { CreateReviewValidator, validatedResult } = require('../utils/validator')

router.get('/my-reviews', CheckLogin, async function (req, res, next) {
    let result = await reviewController.GetMyReviews(req.user._id);
    res.send(result)
})
router.get('/room-type/:roomTypeId', async function (req, res, next) {
    let result = await reviewController.GetReviewsByRoomType(req.params.roomTypeId);
    if (!result) {
        res.status(400).send("loi khi lay danh gia")
    } else {
        res.send(result)
    }
})
router.post('/', CheckLogin, checkRole('customer'), CreateReviewValidator, validatedResult, async function (req, res, next) {
    let { booking, rating, comment } = req.body;
    let result = await reviewController.CreateReview(req.user._id, booking, rating, comment);
    res.send(result)
})
router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await reviewController.DeleteReview(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay danh gia")
    } else {
        res.send(result)
    }
})

module.exports = router;
