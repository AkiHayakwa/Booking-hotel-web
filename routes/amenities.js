var express = require("express");
var router = express.Router();
let amenityController = require('../controllers/amenities')
let { CheckLogin, checkRole } = require('../utils/authHandler')

router.get('/', async function (req, res, next) {
    try {
        let result = await amenityController.GetAllAmenity();
        res.send(result)
    } catch (error) {
        next(error)
    }
})
router.post('/', CheckLogin, checkRole('admin'), async function (req, res, next) {
    try {
        let result = await amenityController.CreateAmenity(req.body);
        res.status(201).send(result)
    } catch (error) {
        next(error)
    }
})
router.put('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    try {
        let result = await amenityController.UpdateAmenity(req.params.id, req.body);
        if (!result) {
            res.status(404).send({ message: "khong tim thay tien nghi" })
        } else {
            res.send(result)
        }
    } catch (error) {
        next(error)
    }
})
router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    try {
        let result = await amenityController.DeleteAmenity(req.params.id);
        if (!result) {
            res.status(404).send({ message: "khong tim thay tien nghi" })
        } else {
            res.send(result)
        }
    } catch (error) {
        next(error)
    }
})

module.exports = router;
