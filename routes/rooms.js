var express = require("express");
var router = express.Router();
let roomController = require('../controllers/rooms')
let { CheckLogin, checkRole, checkHotelOwner } = require('../utils/authHandler')
let { CreateRoomValidator, validatedResult } = require('../utils/validator')

// Public: phong trong cua 1 hotel
router.get('/available/:hotelId', async function (req, res, next) {
    let { checkIn, checkOut, guests } = req.query;
    let result = await roomController.GetAvailableRooms(req.params.hotelId, checkIn, checkOut, guests);
    if (!result) {
        res.status(400).send("loi khi tim phong")
    } else {
        res.send(result)
    }
})
// Public: phong theo hotel
router.get('/hotel/:hotelId', async function (req, res, next) {
    let result = await roomController.GetRoomsByHotel(req.params.hotelId);
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
// Hotel Owner: tao phong cho hotel cua minh
router.post('/:hotelId', CheckLogin, checkRole('hotel_owner', 'admin'), checkHotelOwner, CreateRoomValidator, validatedResult, async function (req, res, next) {
    let { roomNumber, roomType, floor } = req.body;
    let result = await roomController.CreateRoom(roomNumber, roomType, floor, req.params.hotelId);
    res.send(result)
})
router.put('/:id', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let result = await roomController.UpdateRoom(req.params.id, req.body);
    if (!result) {
        res.status(404).send("khong tim thay phong")
    } else {
        res.send(result)
    }
})
router.delete('/:id', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let result = await roomController.DeleteRoom(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay phong")
    } else {
        res.send(result)
    }
})
router.patch('/:id/status', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let { status } = req.body;
    let result = await roomController.UpdateStatus(req.params.id, status);
    if (!result) {
        res.status(404).send("khong tim thay phong")
    } else {
        res.send(result)
    }
})

module.exports = router;
