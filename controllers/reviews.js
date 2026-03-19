let reviewModel = require("../schemas/Review");
let hotelController = require("./hotels");

module.exports = {
    CreateReview: async function (userId, hotelId, bookingId, rating, comment) {
        let newItem = new reviewModel({
            user: userId,
            hotel: hotelId,
            booking: bookingId,
            rating: rating,
            comment: comment || ""
        });
        await newItem.save();
        // Cap nhat rating cua hotel
        await hotelController.UpdateRating(hotelId, rating);
        return newItem;
    },
    GetReviewsByHotel: async function (hotelId) {
        return await reviewModel.find({ hotel: hotelId, isDeleted: false })
            .populate('user', 'username fullName avatarUrl')
            .sort({ createdAt: -1 })
    },
    GetMyReviews: async function (userId) {
        return await reviewModel.find({ user: userId, isDeleted: false })
            .populate('hotel', 'name city')
            .populate({ path: 'booking', populate: { path: 'room', populate: { path: 'roomType' } } })
    },
    DeleteReview: async function (id) {
        try {
            return await reviewModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    }
}
