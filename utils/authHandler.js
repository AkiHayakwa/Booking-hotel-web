let userController = require('../controllers/users')
let hotelModel = require('../schemas/Hotel')
let jwt = require('jsonwebtoken')
module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token;
            if (req.cookies.TOKEN_HOTEL) {
                token = req.cookies.TOKEN_HOTEL
            } else {
                token = req.headers.authorization;
                if (!token || !token.startsWith("Bearer")) {
                    res.status(403).send({ message: "ban chua dang nhap" })
                    return;
                }
                token = token.split(' ')[1]
            }
            let result = jwt.verify(token, 'secret');
            if (result.exp * 1000 < Date.now()) {
                res.status(403).send({ message: "ban chua dang nhap" })
                return;
            }
            let getUser = await userController.GetUserById(result.id);
            if (!getUser) {
                res.status(403).send({ message: "ban chua dang nhap" })
            } else {
                req.user = getUser;
                next();
            }
        } catch (error) {
            res.status(403).send({ message: "ban chua dang nhap" })
        }
    },
    checkRole: function (...requiredRoles) {
        return function (req, res, next) {
            let roleOfUser = req.user.role.name;
            if (requiredRoles.includes(roleOfUser)) {
                next();
            } else {
                res.status(403).send("ban khong co quyen")
            }
        }
    },
    checkHotelOwner: async function (req, res, next) {
        try {
            let hotelId = req.params.hotelId || req.body.hotel;
            if (!hotelId) {
                res.status(400).send("thieu hotelId")
                return;
            }
            let hotel = await hotelModel.findOne({ _id: hotelId, isDeleted: false });
            if (!hotel) {
                res.status(404).send("khong tim thay khach san")
                return;
            }
            // Admin co the truy cap bat ky hotel nao
            if (req.user.role.name === 'admin') {
                req.hotel = hotel;
                next();
                return;
            }
            // Hotel owner chi truy cap hotel cua minh
            if (hotel.owner.toString() === req.user._id.toString()) {
                req.hotel = hotel;
                next();
            } else {
                res.status(403).send("ban khong phai chu khach san nay")
            }
        } catch (error) {
            res.status(400).send("loi xac thuc khach san")
        }
    }
}
