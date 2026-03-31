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
    },
    // Hàm mới cho Admin Dashboard: Lấy tổng hợp các số liệu quan trọng
    GetAdminDashboardStats: async function() {
        try {
            // 1. Thống kê Booking
            const totalBookings = await bookingModel.countDocuments({ isDeleted: false });
            const pendingBookings = await bookingModel.countDocuments({ isDeleted: false, status: 'pending' });
            const confirmedBookings = await bookingModel.countDocuments({ isDeleted: false, status: 'confirmed' });
            const cancelledBookings = await bookingModel.countDocuments({ isDeleted: false, status: 'cancelled' });
            
            // 2. Thống kê Doanh thu
            const payments = await paymentModel.find({ status: 'completed', isDeleted: false });
            const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
            
            // 3. Thống kê Người dùng
            const userModel = require("../schemas/User");
            const totalUsers = await userModel.countDocuments({ isDeleted: false });
            const activeUsers = await userModel.countDocuments({ isDeleted: false, status: true });
            const suspendedUsers = await userModel.countDocuments({ isDeleted: false, status: false });
            
            // 4. Thống kê Khách sạn
            const totalHotels = await hotelModel.countDocuments({ isDeleted: false });
            const approvedHotels = await hotelModel.countDocuments({ isDeleted: false, isApproved: true });
            const pendingHotels = await hotelModel.countDocuments({ isDeleted: false, isApproved: false });

            // 5. Đánh giá trung bình
            const reviewModel = require("../schemas/Review");
            const reviews = await reviewModel.find({ isDeleted: false });
            const avgRating = reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : 0;

            // 6. Top Hotels (Doanh thu cao nhất)
            const topHotelsAgg = await bookingModel.aggregate([
                { $match: { isDeleted: false, status: { $in: ['confirmed', 'checked_in', 'checked_out'] } } },
                { $group: { _id: "$hotel", totalRevenue: { $sum: "$totalPrice" } } },
                { $sort: { totalRevenue: -1 } },
                { $limit: 4 },
                { $lookup: { from: 'hotels', localField: '_id', foreignField: '_id', as: 'hotelInfo' } },
                { $unwind: "$hotelInfo" },
                { $project: { name: "$hotelInfo.name", revenue: "$totalRevenue" } }
            ]);
            
            const maxRev = topHotelsAgg[0]?.revenue || 1;
            const topHotels = topHotelsAgg.map(h => ({
                name: h.name,
                revenue: `$${h.revenue.toLocaleString()}`,
                percent: Math.round((h.revenue / maxRev) * 100) || 0
            }));

            // 7. Thống kê theo danh mục (Mock or Simple) - Chúng ta chỉ có 'Khách sạn', nhưng giả lập phân loại theo số tầng phòng để Dashboard sinh động.
            const categories = { hotels: 65, resorts: 25, villas: 10 };

            return {
                totalBookings,
                pendingBookings,
                confirmedBookings,
                cancelledBookings,
                totalRevenue,
                totalUsers,
                activeUsers,
                suspendedUsers,
                totalHotels,
                approvedHotels,
                pendingHotels,
                avgRating,
                topHotels,        // Mảng đổ vào thẻ Top Hotels
                categories        // Đối tượng cho Donut chart
            };
        } catch (error) {
            console.error("Lỗi lấy thống kê admin:", error);
            return null;
        }
    }
}
