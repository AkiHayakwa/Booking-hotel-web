let bookingModel = require("../schemas/Booking");
let paymentModel = require("../schemas/Payment");
let roomModel = require("../schemas/Room");
let hotelModel = require("../schemas/Hotel");

module.exports = {
    // Admin: thong ke toan he thong
    GetRevenue: async function (month, year) {
        try {
            let matchQuery = { status: 'completed', isDeleted: false };
            if (month && year) {
                let startDate = new Date(year, month - 1, 1);
                let endDate = new Date(year, month, 0, 23, 59, 59);
                matchQuery.paidAt = { $gte: startDate, $lte: endDate };
            } else if (year) {
                let startDate = new Date(year, 0, 1);
                let endDate = new Date(year, 11, 31, 23, 59, 59);
                matchQuery.paidAt = { $gte: startDate, $lte: endDate };
            }
            let payments = await paymentModel.find(matchQuery);
            let total = payments.reduce((sum, p) => sum + p.amount, 0);
            return { total: total, count: payments.length };
        } catch (error) {
            return false;
        }
    },
    // Hotel Owner: thong ke theo hotel
    GetRevenueByHotel: async function (hotelId, month, year) {
        try {
            let bookingQuery = { hotel: hotelId, isDeleted: false, status: 'checked_out' };
            if (month && year) {
                let startDate = new Date(year, month - 1, 1);
                let endDate = new Date(year, month, 0, 23, 59, 59);
                bookingQuery.createdAt = { $gte: startDate, $lte: endDate };
            }
            let bookings = await bookingModel.find(bookingQuery);
            let bookingIds = bookings.map(b => b._id);
            let payments = await paymentModel.find({ booking: { $in: bookingIds }, status: 'completed', isDeleted: false });
            let total = payments.reduce((sum, p) => sum + p.amount, 0);
            return { total: total, count: payments.length, bookings: bookings.length };
        } catch (error) {
            return false;
        }
    },
    GetBookingStats: async function () {
        try {
            let total = await bookingModel.countDocuments({ isDeleted: false });
            let pending = await bookingModel.countDocuments({ isDeleted: false, status: 'pending' });
            let confirmed = await bookingModel.countDocuments({ isDeleted: false, status: 'confirmed' });
            let checkedIn = await bookingModel.countDocuments({ isDeleted: false, status: 'checked_in' });
            let checkedOut = await bookingModel.countDocuments({ isDeleted: false, status: 'checked_out' });
            let cancelled = await bookingModel.countDocuments({ isDeleted: false, status: 'cancelled' });
            let totalHotels = await hotelModel.countDocuments({ isDeleted: false, isApproved: true });
            return { total, pending, confirmed, checkedIn, checkedOut, cancelled, totalHotels };
        } catch (error) {
            return false;
        }
    },
    GetBookingStatsByHotel: async function (hotelId) {
        try {
            let total = await bookingModel.countDocuments({ hotel: hotelId, isDeleted: false });
            let pending = await bookingModel.countDocuments({ hotel: hotelId, isDeleted: false, status: 'pending' });
            let confirmed = await bookingModel.countDocuments({ hotel: hotelId, isDeleted: false, status: 'confirmed' });
            let checkedIn = await bookingModel.countDocuments({ hotel: hotelId, isDeleted: false, status: 'checked_in' });
            let checkedOut = await bookingModel.countDocuments({ hotel: hotelId, isDeleted: false, status: 'checked_out' });
            let cancelled = await bookingModel.countDocuments({ hotel: hotelId, isDeleted: false, status: 'cancelled' });
            return { total, pending, confirmed, checkedIn, checkedOut, cancelled };
        } catch (error) {
            return false;
        }
    },
    GetOccupancyByHotel: async function (hotelId) {
        try {
            let totalRooms = await roomModel.countDocuments({ hotel: hotelId, isDeleted: false, isActive: true });
            let occupiedRooms = await roomModel.countDocuments({ hotel: hotelId, isDeleted: false, isActive: true, status: 'occupied' });
            let rate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;
            return { totalRooms, occupiedRooms, occupancyRate: rate + '%' };
        } catch (error) {
            return false;
        }
    }
}
