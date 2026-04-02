let bookingModel = require("../schemas/Booking");
let roomModel = require("../schemas/Room");

module.exports = {
    CreateBooking: async function (userId, hotelId, rooms, checkInDate, checkOutDate, numberOfGuests, specialRequests, promotionId, discountAmount) {
        try {
            if (!Array.isArray(rooms) || rooms.length === 0) {
                return { error: 'Danh sách phòng không hợp lệ' };
            }

            let nights = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24);
            if (nights <= 0) {
                return { error: 'Ngày trả phòng phải sau ngày nhận phòng' };
            }

            let totalPrice = 0;
            for (let roomId of rooms) {
                let room = await roomModel.findById(roomId).populate('roomType');
                if (!room) return { error: `Không tìm thấy phòng (ID: ${roomId})` };
                if (!room.roomType) return { error: `Phòng ${room.roomNumber} chưa được gán Loại Phòng hợp lệ` };
                totalPrice += room.roomType.pricePerNight * nights;
            }

            if (discountAmount) {
                totalPrice = totalPrice - discountAmount;
            }
            let bookingCode = 'BK' + Date.now().toString(36).toUpperCase();

            let newItem = new bookingModel({
                user: userId,
                hotel: hotelId,
                rooms: rooms,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                numberOfGuests: numberOfGuests,
                totalPrice: totalPrice,
                specialRequests: specialRequests || "",
                promotion: promotionId || null,
                discountAmount: discountAmount || 0,
                bookingCode: bookingCode
            });
            await newItem.save();
            return newItem;
        } catch (error) {
            console.error("Lỗi khi tạo booking:", error);
            return { error: 'Lỗi hệ thống khi tạo booking' };
        }
    },
    GetAllBooking: async function () {
        return await bookingModel.find({ isDeleted: false })
            .populate('user', 'username email fullName')
            .populate('hotel', 'name city')
            .populate({ path: 'rooms', populate: { path: 'roomType' } })
    },
    GetBookingsByHotel: async function (hotelId) {
        return await bookingModel.find({ hotel: hotelId, isDeleted: false })
            .populate('user', 'username email fullName')
            .populate({ path: 'rooms', populate: { path: 'roomType' } })
    },
    GetBookingById: async function (id) {
        try {
            return await bookingModel.findOne({ _id: id, isDeleted: false })
                .populate('user', 'username email fullName')
                .populate('hotel', 'name city')
                .populate({ path: 'rooms', populate: { path: 'roomType' } })
                .populate('promotion')
        } catch (error) {
            return false;
        }
    },
    GetMyBookings: async function (userId) {
        return await bookingModel.find({ user: userId, isDeleted: false })
            .populate('hotel', 'name city images')
            .populate({ path: 'rooms', populate: { path: 'roomType' } })
    },
    ConfirmBooking: async function (id) {
        try {
            let booking = await bookingModel.findOne({ _id: id, isDeleted: false });
            if (!booking || booking.status !== 'pending') return false;
            booking.status = 'confirmed';
            await booking.save();
            return booking;
        } catch (error) {
            return false;
        }
    },
    CheckIn: async function (id) {
        try {
            let booking = await bookingModel.findOne({ _id: id, isDeleted: false });
            if (!booking || booking.status !== 'confirmed') return false;
            booking.status = 'checked_in';
            await booking.save();
            await roomModel.updateMany({ _id: { $in: booking.rooms } }, { status: 'occupied' });
            return booking;
        } catch (error) {
            return false;
        }
    },
    CheckOut: async function (id) {
        try {
            let booking = await bookingModel.findOne({ _id: id, isDeleted: false });
            if (!booking || booking.status !== 'checked_in') return false;
            booking.status = 'checked_out';
            await booking.save();
            await roomModel.updateMany({ _id: { $in: booking.rooms } }, { status: 'available' });
            return booking;
        } catch (error) {
            return false;
        }
    },
    CancelBooking: async function (id) {
        try {
            let booking = await bookingModel.findOne({ _id: id, isDeleted: false });
            if (!booking || !['pending', 'confirmed'].includes(booking.status)) return false;
            booking.status = 'cancelled';
            await booking.save();
            return booking;
        } catch (error) {
            return false;
        }
    }
}
