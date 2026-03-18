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
        body('hotel').notEmpty().withMessage("hotel khong duoc de trong").bail().isMongoId().withMessage("hotel phai la ID"),
        body('room').notEmpty().withMessage("room khong duoc de trong").bail().isMongoId().withMessage("room phai la ID"),
        body('checkInDate').notEmpty().withMessage("checkInDate khong duoc de trong").bail().isISO8601().withMessage("checkInDate sai dinh dang"),
        body('checkOutDate').notEmpty().withMessage("checkOutDate khong duoc de trong").bail().isISO8601().withMessage("checkOutDate sai dinh dang"),
        body('numberOfGuests').notEmpty().withMessage("numberOfGuests khong duoc de trong").bail().isInt({ min: 1 }).withMessage("numberOfGuests phai >= 1"),
    ],
    CreateRoomTypeValidator: [
        body('name').notEmpty().withMessage("name khong duoc de trong"),
        body('pricePerNight').notEmpty().withMessage("pricePerNight khong duoc de trong").bail().isFloat({ min: 0 }).withMessage("pricePerNight phai >= 0"),
        body('maxGuests').notEmpty().withMessage("maxGuests khong duoc de trong").bail().isInt({ min: 1 }).withMessage("maxGuests phai >= 1"),
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
        body('title').notEmpty().withMessage("title khong duoc de trong"),
        body('hotel').notEmpty().withMessage("hotel khong duoc de trong").bail().isMongoId().withMessage("hotel phai la ID"),
        body('discountType').notEmpty().withMessage("discountType khong duoc de trong").bail().isIn(['percentage', 'fixed_amount']).withMessage("discountType phai la percentage hoac fixed_amount"),
        body('discountValue').notEmpty().withMessage("discountValue khong duoc de trong").bail().isFloat({ min: 0 }).withMessage("discountValue phai >= 0"),
        body('startDate').notEmpty().withMessage("startDate khong duoc de trong").bail().isISO8601().withMessage("startDate sai dinh dang"),
        body('endDate').notEmpty().withMessage("endDate khong duoc de trong").bail().isISO8601().withMessage("endDate sai dinh dang"),
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
