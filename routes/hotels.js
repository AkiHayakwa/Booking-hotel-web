var express = require("express");
var router = express.Router();
let hotelController = require('../controllers/hotels')
let { CheckLogin, checkRole, checkHotelOwner } = require('../utils/authHandler')

// Public: lay tat ca hotel da duyet
router.get('/', async function (req, res, next) {
    let result = await hotelController.GetAllHotel();
    res.send(result)
})
// Public: tim hotel theo thanh pho
router.get('/search', async function (req, res, next) {
    let { city } = req.query;
    if (!city) {
        res.status(400).send("vui long nhap thanh pho")
        return;
    }
    let result = await hotelController.GetHotelsByCity(city);
    res.send(result)
})
// Admin: lay tat ca hotel (ca chua duyet)
router.get('/admin/all', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await hotelController.GetAllHotelAdmin();
    res.send(result)
})
// Hotel Owner: lay hotel cua minh
router.get('/my-hotels', CheckLogin, checkRole('hotel_owner'), async function (req, res, next) {
    let result = await hotelController.GetHotelsByOwner(req.user._id);
    res.send(result)
})
// Public: lay hotel theo id
router.get('/:id', async function (req, res, next) {
    let result = await hotelController.GetHotelById(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay khach san")
    } else {
        res.send(result)
    }
})
// Hotel Owner: tao hotel moi (cho duyet)
router.post('/', CheckLogin, checkRole('hotel_owner'), async function (req, res, next) {
    let { name, description, address, city, images, phone, email, amenities } = req.body;
    let result = await hotelController.CreateHotel(name, description, address, city, images, phone, email, req.user._id, amenities);
    res.send(result)
})
// Hotel Owner: cap nhat hotel cua minh
router.put('/:hotelId', CheckLogin, checkRole('hotel_owner', 'admin'), checkHotelOwner, async function (req, res, next) {
    let result = await hotelController.UpdateHotel(req.params.hotelId, req.body);
    if (!result) {
        res.status(404).send("khong tim thay khach san")
    } else {
        res.send(result)
    }
})
// Admin: duyet hotel
router.patch('/:id/approve', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await hotelController.ApproveHotel(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay khach san")
    } else {
        res.send(result)
    }
})
// Admin: tu choi hotel
router.patch('/:id/reject', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await hotelController.RejectHotel(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay khach san")
    } else {
        res.send(result)
    }
})
// Admin: xoa hotel
router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await hotelController.DeleteHotel(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay khach san")
    } else {
        res.send(result)
    }
})

module.exports = router;
