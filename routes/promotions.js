var express = require("express");
var router = express.Router();
let promotionController = require('../controllers/promotions')
let { CheckLogin, checkRole } = require('../utils/authHandler')
let { CreatePromotionValidator, validatedResult } = require('../utils/validator')

router.get('/', async function (req, res, next) {
    let result = await promotionController.GetAllPromotion();
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
router.post('/', CheckLogin, checkRole('admin'), CreatePromotionValidator, validatedResult, async function (req, res, next) {
    let result = await promotionController.CreatePromotion(req.body);
    res.send(result)
})
router.post('/validate', CheckLogin, async function (req, res, next) {
    let { promoCode, roomTypeId, nights } = req.body;
    let result = await promotionController.ValidatePromoCode(promoCode, roomTypeId, nights);
    if (!result) {
        res.status(404).send("ma uu dai khong hop le")
    } else {
        res.send(result)
    }
})
router.put('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await promotionController.UpdatePromotion(req.params.id, req.body);
    if (!result) {
        res.status(404).send("khong tim thay uu dai")
    } else {
        res.send(result)
    }
})
router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await promotionController.DeletePromotion(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay uu dai")
    } else {
        res.send(result)
    }
})

module.exports = router;
