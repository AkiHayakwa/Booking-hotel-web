let { body, validationResult } = require('express-validator')
module.exports = {
    validatedResult: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(404).send(result.errors.map(
                function (e) {
                    return {
                        [e.path]: e.msg
                    }
                }
            ));
            return;
        }
        next();
    },
    RegisterValidator: [
        body('email').notEmpty().withMessage("email khong duoc de trong").bail().isEmail().withMessage("email sai dinh dang").normalizeEmail(),
        body('username').notEmpty().withMessage("username khong duoc de trong").bail().isAlphanumeric().withMessage("username khong duoc chua ki tu dac biet"),
        body('password').notEmpty().withMessage("password khong duoc de trong").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("password phai co it nhat 8 ki tu trong do co it nhat 1 ki tu chu hoa, 1 ki tu chu thuong, 1 ki tu so va 1 ki tu dac biet"),
    ],
    ChangePasswordValidator: [
        body('oldpassword').notEmpty().withMessage("old password khong duoc de trong"),
        body('newpassword').notEmpty().withMessage("new password khong duoc de trong").bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage("password phai co it nhat 8 ki tu trong do co it nhat 1 ki tu chu hoa, 1 ki tu chu thuong, 1 ki tu so va 1 ki tu dac biet"),
    ],
    CreateBookingValidator: [
        body('hotel').notEmpty().withMessage("hotel không được để trống").bail().isMongoId().withMessage("hotel phải là ID"),
        body('rooms').notEmpty().withMessage("rooms không được để trống").bail().isArray().withMessage("rooms phải là mảng"),
        body('rooms.*').isMongoId().withMessage("mỗi phần tử trong rooms phải là ID"),
        body('checkInDate').notEmpty().withMessage("checkInDate không được để trống").bail().isISO8601().withMessage("checkInDate sai định dạng").custom((value) => {
            if (new Date(value).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)) {
                throw new Error("Ngày nhận phòng không thể trong quá khứ");
            }
            return true;
        }),
        body('checkOutDate').notEmpty().withMessage("checkOutDate không được để trống").bail().isISO8601().withMessage("checkOutDate sai định dạng").custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.checkInDate)) {
                throw new Error("Ngày trả phòng phải sau ngày nhận phòng");
            }
            return true;
        }),
        body('numberOfGuests').notEmpty().withMessage("numberOfGuests không được để trống").bail().isInt({ min: 1 }).withMessage("numberOfGuests phải >= 1"),
    ],
    CreateRoomTypeValidator: [
        body('name').notEmpty().withMessage("name không được để trống"),
        body('pricePerNight').notEmpty().withMessage("pricePerNight không được để trống").bail().isFloat({ min: 1000 }).withMessage("Giá phòng phải >= 1,000 VNĐ"),
        body('maxGuests').notEmpty().withMessage("maxGuests không được để trống").bail().isInt({ min: 1 }).withMessage("maxGuests phải >= 1"),
    ],
    CreateRoomValidator: [
        body('roomNumber').notEmpty().withMessage("roomNumber khong duoc de trong"),
        body('roomType').notEmpty().withMessage("roomType khong duoc de trong").bail().isMongoId().withMessage("roomType phai la ID"),
        body('floor').notEmpty().withMessage("floor khong duoc de trong").bail().isInt({ min: 1 }).withMessage("floor phai >= 1"),
    ],
    CreateHotelValidator: [
        body('name').notEmpty().withMessage("name khong duoc de trong"),
        body('address').notEmpty().withMessage("address khong duoc de trong"),
        body('city').notEmpty().withMessage("city khong duoc de trong"),
    ],
    CreateBlogValidator: [
        body('title').notEmpty().withMessage("title khong duoc de trong"),
        body('content').notEmpty().withMessage("content khong duoc de trong"),
    ],
    CreatePromotionValidator: [
        body('title').notEmpty().withMessage("title không được để trống"),
        body('hotel').notEmpty().withMessage("hotel không được để trống").bail().isMongoId().withMessage("hotel phải là ID"),
        body('discountType').notEmpty().withMessage("discountType không được để trống").bail().isIn(['percentage', 'fixed_amount']).withMessage("discountType phải là percentage hoặc fixed_amount"),
        body('discountValue').notEmpty().withMessage("discountValue không được để trống").bail().isFloat({ min: 0 }).withMessage("discountValue phải >= 0").custom((value, { req }) => {
            if (req.body.discountType === 'percentage' && value > 100) {
                throw new Error("Phần trăm giảm giá không thể vượt quá 100%");
            }
            return true;
        }),
        body('startDate').notEmpty().withMessage("startDate không được để trống").bail().isISO8601().withMessage("startDate sai định dạng"),
        body('endDate').notEmpty().withMessage("endDate không được để trống").bail().isISO8601().withMessage("endDate sai định dạng").custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
            }
            return true;
        }),
    ],
    CreateReviewValidator: [
        body('hotel').notEmpty().withMessage("hotel khong duoc de trong").bail().isMongoId().withMessage("hotel phai la ID"),
        body('booking').notEmpty().withMessage("booking khong duoc de trong").bail().isMongoId().withMessage("booking phai la ID"),
        body('rating').notEmpty().withMessage("rating khong duoc de trong").bail().isInt({ min: 1, max: 5 }).withMessage("rating phai tu 1 den 5"),
    ],
    CreateCommentValidator: [
        body('content').notEmpty().withMessage("content khong duoc de trong"),
    ]
}
