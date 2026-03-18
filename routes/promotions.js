var express = require("express");
var router = express.Router();
let promotionController = require('../controllers/promotions')
let { CheckLogin, checkRole, checkHotelOwner } = require('../utils/authHandler')
let { CreatePromotionValidator, validatedResult } = require('../utils/validator')

// Public: uu dai dang hieu luc
router.get('/', async function (req, res, next) {
    let result = await promotionController.GetAllPromotion();
    res.send(result)
})
// Hotel Owner: uu dai cua hotel minh
router.get('/hotel/:hotelId', CheckLogin, checkRole('hotel_owner', 'admin'), checkHotelOwner, async function (req, res, next) {
    let result = await promotionController.GetPromotionsByHotel(req.params.hotelId);
    res.send(result)
})
router.get('/:id', async function (req, res, next) {
    let result = await promotionController.GetPromotionById(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay uu dai")
    } else {
        res.send(result)
    }
})
// Hotel Owner: tao uu dai
router.post('/', CheckLogin, checkRole('hotel_owner', 'admin'), CreatePromotionValidator, validatedResult, async function (req, res, next) {
    let result = await promotionController.CreatePromotion(req.body);
    res.send(result)
})
// Validate promo code
router.post('/validate', CheckLogin, async function (req, res, next) {
    let { promoCode, hotelId, roomTypeId, nights } = req.body;
    let result = await promotionController.ValidatePromoCode(promoCode, hotelId, roomTypeId, nights);
    if (!result) {
        res.status(404).send("ma uu dai khong hop le")
    } else {
        res.send(result)
    }
})
router.put('/:id', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let result = await promotionController.UpdatePromotion(req.params.id, req.body);
    if (!result) {
        res.status(404).send("khong tim thay uu dai")
    } else {
        res.send(result)
    }
})
router.delete('/:id', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let result = await promotionController.DeletePromotion(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay uu dai")
    } else {
        res.send(result)
    }
})

module.exports = router;
