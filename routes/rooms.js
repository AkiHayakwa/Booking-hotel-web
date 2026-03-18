var express = require("express");
var router = express.Router();
let roomController = require('../controllers/rooms')
let { CheckLogin, checkRole } = require('../utils/authHandler')
let { CreateRoomValidator, validatedResult } = require('../utils/validator')

router.get('/available', async function (req, res, next) {
    let { checkIn, checkOut, guests } = req.query;
    let result = await roomController.GetAvailableRooms(checkIn, checkOut, guests);
    if (!result) {
        res.status(400).send("loi khi tim phong")
    } else {
        res.send(result)
    }
})
router.get('/', async function (req, res, next) {
    let result = await roomController.GetAllRoom();
    res.send(result)
})
router.get('/:id', async function (req, res, next) {
    let result = await roomController.GetRoomById(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay phong")
    } else {
        res.send(result)
    }
})
router.post('/', CheckLogin, checkRole('admin'), CreateRoomValidator, validatedResult, async function (req, res, next) {
    let { roomNumber, roomType, floor } = req.body;
    let result = await roomController.CreateRoom(roomNumber, roomType, floor);
    res.send(result)
})
router.put('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await roomController.UpdateRoom(req.params.id, req.body);
    if (!result) {
        res.status(404).send("khong tim thay phong")
    } else {
        res.send(result)
    }
})
router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await roomController.DeleteRoom(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay phong")
    } else {
        res.send(result)
    }
})
router.patch('/:id/status', CheckLogin, checkRole('admin', 'staff'), async function (req, res, next) {
    let { status } = req.body;
    let result = await roomController.UpdateStatus(req.params.id, status);
    if (!result) {
        res.status(404).send("khong tim thay phong")
    } else {
        res.send(result)
    }
})

module.exports = router;
