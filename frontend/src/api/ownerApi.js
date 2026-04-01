import axiosClient from './axiosClient';

/**
 * ownerApi — Tất cả API call cho Hotel Owner Dashboard
 *
 * QUAN TRỌNG: hotelId luôn được truyền từ OwnerContext (useOwner().hotelId)
 * Không bao giờ nhận hotelId từ URL params hay user input.
 * Backend cũng bảo vệ bằng checkHotelOwner middleware → trả 403 nếu không phải chủ KS.
 */
const ownerApi = {

  // ── Hotel ──────────────────────────────────────────────────────────
  /** Lấy danh sách KS của chính mình (backend filter owner = req.user._id) */
  getMyHotels: () =>
    axiosClient.get('/hotels/my-hotels'),

  /** Xem chi tiết 1 KS */
  getHotel: (id) =>
    axiosClient.get(`/hotels/${id}`),

  /**
   * Tạo khách sạn mới cho owner.
   * QUAN TRỌNG: Không truyền `owner` trong data — backend tự gán từ req.user._id.
   * KS mới sẽ có isApproved = false (chờ Admin duyệt).
   */
  createHotel: (data) =>
    axiosClient.post('/hotels', data),

  /** Cập nhật thông tin KS (checkHotelOwner ở backend) */
  updateHotel: (id, data) =>
    axiosClient.put(`/hotels/${id}`, data),

  // ── Room Types ─────────────────────────────────────────────────────
  /** Lấy tất cả loại phòng của KS */
  getRoomTypes: (hotelId) =>
    axiosClient.get(`/room-types/hotel/${hotelId}`),

  /** Xem chi tiết 1 loại phòng */
  getRoomType: (id) =>
    axiosClient.get(`/room-types/${id}`),

  /** Tạo loại phòng mới cho KS */
  createRoomType: (hotelId, data) =>
    axiosClient.post(`/room-types/${hotelId}`, data),

  /** Cập nhật loại phòng */
  updateRoomType: (id, data) =>
    axiosClient.put(`/room-types/${id}`, data),

  /** Xóa loại phòng */
  deleteRoomType: (id) =>
    axiosClient.delete(`/room-types/${id}`),

  // ── Rooms ──────────────────────────────────────────────────────────
  /** Lấy tất cả phòng của KS */
  getRooms: (hotelId) =>
    axiosClient.get(`/rooms/hotel/${hotelId}`),

  /** Tạo phòng mới */
  createRoom: (hotelId, data) =>
    axiosClient.post(`/rooms/${hotelId}`, data),

  /** Cập nhật thông tin phòng */
  updateRoom: (id, data) =>
    axiosClient.put(`/rooms/${id}`, data),

  /** Xóa phòng */
  deleteRoom: (id) =>
    axiosClient.delete(`/rooms/${id}`),

  /** Đổi trạng thái phòng: available / occupied / maintenance */
  changeRoomStatus: (id, status) =>
    axiosClient.patch(`/rooms/${id}/status`, { status }),

  // ── Bookings ────────────────────────────────────────────────────────
  /** Lấy tất cả booking của KS (có thể filter theo status) */
  getBookings: (hotelId, params = {}) =>
    axiosClient.get(`/bookings/hotel/${hotelId}`, { params }),

  /** Xem chi tiết 1 booking */
  getBooking: (id) =>
    axiosClient.get(`/bookings/${id}`),

  /** Xác nhận booking: pending → confirmed */
  confirmBooking: (id) =>
    axiosClient.patch(`/bookings/${id}/confirm`),

  /** Check-in: confirmed → checked_in */
  checkIn: (id) =>
    axiosClient.patch(`/bookings/${id}/check-in`),

  /** Check-out: checked_in → checked_out */
  checkOut: (id) =>
    axiosClient.patch(`/bookings/${id}/check-out`),

  /** Hủy booking */
  cancelBooking: (id) =>
    axiosClient.patch(`/bookings/${id}/cancel`),

  // ── Payments ───────────────────────────────────────────────────────
  /** Xem thanh toán theo booking */
  getPaymentByBooking: (bookingId) =>
    axiosClient.get(`/payments/booking/${bookingId}`),

  /** Tạo thanh toán sau check-out */
  createPayment: (data) =>
    axiosClient.post('/payments', data),

  // ── Promotions ─────────────────────────────────────────────────────
  /** Lấy tất cả ưu đãi của KS */
  getPromotions: (hotelId) =>
    axiosClient.get(`/promotions/hotel/${hotelId}`),

  /**
   * Tạo ưu đãi mới.
   * QUAN TRỌNG: data.hotel phải được set = hotelId từ OwnerContext,
   * không cho phép người dùng nhập hotelId thủ công.
   */
  createPromotion: (data) =>
    axiosClient.post('/promotions', data),

  /** Cập nhật ưu đãi */
  updatePromotion: (id, data) =>
    axiosClient.put(`/promotions/${id}`, data),

  /** Xóa ưu đãi */
  deletePromotion: (id) =>
    axiosClient.delete(`/promotions/${id}`),

  // ── Reviews ────────────────────────────────────────────────────────
  /** Xem tất cả đánh giá của KS (read-only với owner) */
  getReviews: (hotelId) =>
    axiosClient.get(`/reviews/hotel/${hotelId}`),

  // ── Statistics ─────────────────────────────────────────────────────
  /** Doanh thu của KS theo tháng/năm */
  getRevenue: (hotelId, params = {}) =>
    axiosClient.get(`/stats/hotel/${hotelId}/revenue`, { params }),

  /** Thống kê booking của KS */
  getBookingStats: (hotelId, params = {}) =>
    axiosClient.get(`/stats/hotel/${hotelId}/bookings`, { params }),

  /** Tỷ lệ lấp đầy phòng */
  getOccupancy: (hotelId, params = {}) =>
    axiosClient.get(`/stats/hotel/${hotelId}/occupancy`, { params }),

  // ── Amenities (chỉ đọc, để chọn tiện nghi cho KS) ──────────────────
  /** Lấy danh sách tất cả tiện nghi hệ thống để owner chọn cho KS */
  getAmenities: () =>
    axiosClient.get('/amenities'),


};

export default ownerApi;
