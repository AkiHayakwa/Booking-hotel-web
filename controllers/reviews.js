let reviewModel = require("../schemas/Review");
let bookingModel = require("../schemas/Booking");
let hotelController = require("./hotels");

module.exports = {
    GetAllReviewsAdmin: async function () {
        return await reviewModel.find({ isDeleted: false })
            .populate('user', 'username fullName avatarUrl')
            .populate('hotel', 'name city')
            .sort({ createdAt: -1 })
    },
    CreateReview: async function (userId, hotelId, bookingId, rating, comment) {
        try {
            // Kiểm tra booking tồn tại, thuộc về user, và đã checked_out
            let booking = await bookingModel.findOne({ _id: bookingId, isDeleted: false });
            if (!booking) return { error: 'Không tìm thấy đơn đặt phòng.' };
            if (booking.user.toString() !== userId.toString()) return { error: 'Đơn đặt phòng không thuộc về bạn.' };
            if (booking.status !== 'checked_out') return { error: 'Chỉ có thể đánh giá sau khi đã trả phòng (checked out).' };
            if (booking.hotel.toString() !== hotelId.toString()) return { error: 'Đơn đặt phòng không thuộc khách sạn này.' };

            // Kiểm tra đã review booking này chưa
            let existingReview = await reviewModel.findOne({ booking: bookingId, isDeleted: false });
            if (existingReview) return { error: 'Bạn đã đánh giá đơn đặt phòng này rồi.' };

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
        } catch (error) {
            console.error("Lỗi khi tạo review:", error);
            return { error: 'Lỗi hệ thống khi tạo đánh giá.' };
        }
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
    // Lấy danh sách booking đã checked_out và chưa được review (eligible to review)
    GetEligibleBookings: async function (userId, hotelId) {
        try {
            // Lấy tất cả booking checked_out của user tại hotel
            let bookings = await bookingModel.find({
                user: userId,
                hotel: hotelId,
                status: 'checked_out',
                isDeleted: false
            }).select('_id bookingCode checkInDate checkOutDate');

            if (!bookings || bookings.length === 0) return [];

            // Lọc ra những booking chưa được review
            let reviewedBookingIds = await reviewModel.find({
                user: userId,
                hotel: hotelId,
                isDeleted: false
            }).select('booking');
            let reviewedIds = reviewedBookingIds.map(r => r.booking.toString());

            return bookings.filter(b => !reviewedIds.includes(b._id.toString()));
        } catch (error) {
            return [];
        }
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
