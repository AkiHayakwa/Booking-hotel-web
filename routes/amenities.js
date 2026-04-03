var express = require("express");
var router = express.Router();
let amenityController = require('../controllers/amenities')
let { CheckLogin, checkRole } = require('../utils/authHandler')

router.get('/', async function (req, res, next) {
    let result = await amenityController.GetAllAmenity();
    res.send(result)
})
router.post('/', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await amenityController.CreateAmenity(req.body);
    res.send(result)
})
router.put('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await amenityController.UpdateAmenity(req.params.id, req.body);
    if (!result) {
        res.status(404).send("khong tim thay tien nghi")
    } else {
        res.send(result)
    }
})
router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await amenityController.DeleteAmenity(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay tien nghi")
    } else {
        res.send(result)
    }
})

module.exports = router;
