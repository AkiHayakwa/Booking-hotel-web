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
    UpdateUserValidator: [
        body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10,11}$/).withMessage("Số điện thoại phải từ 10-11 chữ số"),
        body('password').optional({ checkFalsy: true }).isStrongPassword({
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
            if (new Date(value).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
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
        body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10,11}$/).withMessage("Số điện thoại phải từ 10-11 chữ số"),
        body('description').optional({ checkFalsy: true }).isLength({ min: 50 }).withMessage("Mô tả phải có ít nhất 50 ký tự"),
    ],
    UpdateHotelValidator: [
        body('name').optional({ checkFalsy: true }).notEmpty().withMessage("name khong duoc de trong"),
        body('address').optional({ checkFalsy: true }).notEmpty().withMessage("address khong duoc de trong"),
        body('city').optional({ checkFalsy: true }).notEmpty().withMessage("city khong duoc de trong"),
        body('phone').optional({ checkFalsy: true }).matches(/^[0-9]{10,11}$/).withMessage("Số điện thoại phải từ 10-11 chữ số"),
        body('description').optional({ checkFalsy: true }).isLength({ min: 50 }).withMessage("Mô tả phải có ít nhất 50 ký tự"),
    ],
    CreateBlogValidator: [
        body('title').notEmpty().withMessage("title khong duoc de trong"),
        body('content').notEmpty().withMessage("content khong duoc de trong"),
    ],
    CreatePromotionValidator: [
        body('title').notEmpty().withMessage("title không được để trống"),
        body('hotel').notEmpty().withMessage("hotel không được để trống").bail().isMongoId().withMessage("hotel phải là ID"),
        body('discountType').notEmpty().withMessage("discountType không được để trống").bail().isIn(['percentage', 'fixed_amount']).withMessage("discountType phải là percentage hoặc fixed_amount"),
        body('discountValue').notEmpty().withMessage("discountValue không được để trống").bail().isFloat({ min: 1 }).withMessage("discountValue phải >= 1").custom((value, { req }) => {
            if (req.body.discountType === 'percentage') {
                if (value < 1 || value > 100) {
                    throw new Error("Phần trăm giảm giá phải từ 1% đến 100%");
                }
            } else if (req.body.discountType === 'fixed_amount') {
                if (value < 1000) {
                    throw new Error("Số tiền giảm trực tiếp phải từ 1,000đ trở lên");
                }
            }
            return true;
        }),
        body('startDate').notEmpty().withMessage("startDate không được để trống").bail().isISO8601().withMessage("startDate sai định dạng"),
        body('endDate').notEmpty().withMessage("endDate không được để trống").bail().isISO8601().withMessage("endDate sai định dạng").custom((value, { req }) => {
            if (new Date(value) < new Date(req.body.startDate)) {
                throw new Error("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
            }
            return true;
        }),
    ],
    UpdatePromotionValidator: [
        body('title').optional({ checkFalsy: true }).notEmpty().withMessage("title không được để trống"),
        body('discountType').optional({ checkFalsy: true }).isIn(['percentage', 'fixed_amount']).withMessage("discountType phải là percentage hoặc fixed_amount"),
        body('discountValue').optional({ checkFalsy: true }).isFloat({ min: 1 }).withMessage("discountValue phải >= 1").custom((value, { req }) => {
            const type = req.body.discountType;
            if (type === 'percentage') {
                if (value < 1 || value > 100) {
                    throw new Error("Phần trăm giảm giá phải từ 1% đến 100%");
                }
            } else if (type === 'fixed_amount') {
                if (value < 1000) {
                    throw new Error("Số tiền giảm trực tiếp phải từ 1,000đ trở lên");
                }
            }
            return true;
        }),
        body('startDate').optional({ checkFalsy: true }).isISO8601().withMessage("startDate sai định dạng"),
        body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage("endDate sai định dạng").custom((value, { req }) => {
            if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
                throw new Error("Ngày kết thúc không được nhỏ hơn ngày bắt đầu");
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
