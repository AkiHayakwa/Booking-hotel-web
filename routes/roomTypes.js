var express = require("express");
var router = express.Router();
let roomTypeController = require('../controllers/roomTypes')
let { CheckLogin, checkRole, checkHotelOwner } = require('../utils/authHandler')
let { CreateRoomTypeValidator, validatedResult } = require('../utils/validator')

// Public: lay tat ca room types
router.get('/', async function (req, res, next) {
    let result = await roomTypeController.GetAllRoomType();
    res.send(result)
})
// Public: lay room types theo hotel
router.get('/hotel/:hotelId', async function (req, res, next) {
    let result = await roomTypeController.GetRoomTypesByHotel(req.params.hotelId);
    res.send(result)
})
router.get('/:id', async function (req, res, next) {
    let result = await roomTypeController.GetRoomTypeById(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay loai phong")
    } else {
        res.send(result)
    }
})
// Hotel Owner: tao room type cho hotel cua minh
// Hỗ trợ cả 2 cách: qua URL hoặc qua Body
router.post(['/', '/:hotelId'], CheckLogin, checkRole('hotel_owner', 'admin'), checkHotelOwner, CreateRoomTypeValidator, validatedResult, async function (req, res, next) {
    let { name, description, pricePerNight, maxGuests, images, hotel } = req.body;
    // Lấy hotelId từ URL (req.params.hotelId) hoặc từ Body (req.body.hotel)
    let hotelId = req.params.hotelId || hotel;
    
    if (!hotelId) {
        return res.status(400).json({ message: "Vui lòng cung cấp Hotel ID" });
    }

    let result = await roomTypeController.CreateRoomType(name, description, pricePerNight, maxGuests, images, hotelId);
    res.send(result);
})
router.put('/:id', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let result = await roomTypeController.UpdateRoomType(req.params.id, req.body);
    if (!result) {
        res.status(404).send("khong tim thay loai phong")
    } else {
        res.send(result)
    }
})
router.delete('/:id', CheckLogin, checkRole('hotel_owner', 'admin'), async function (req, res, next) {
    let result = await roomTypeController.DeleteRoomType(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay loai phong")
    } else {
        res.send(result)
    }
})

module.exports = router;
