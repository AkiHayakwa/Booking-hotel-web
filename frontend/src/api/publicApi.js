import axiosClient from './axiosClient';

/**
 * publicApi — API calls không cần auth, dành cho phía khách hàng
 */
const publicApi = {

  // ── Hotels ─────────────────────────────────────────────────────────
  /** Tìm hotel theo thành phố (chỉ trả về isApproved = true) */
  searchHotels: (city) =>
    axiosClient.get('/hotels/search', { params: { city } }),

  /** Lấy tất cả hotel đã duyệt */
  getAllHotels: () =>
    axiosClient.get('/hotels'),

  /** Chi tiết 1 hotel */
  getHotel: (id) =>
    axiosClient.get(`/hotels/${id}`),

  // ── Available Rooms ─────────────────────────────────────────────────
  /** Lấy phòng trống của hotel theo ngày + số khách */
  getAvailableRooms: (hotelId, checkIn, checkOut, guests) =>
    axiosClient.get(`/rooms/available/${hotelId}`, {
      params: { checkIn, checkOut, guests },
    }),

  // ── Promotions ──────────────────────────────────────────────────────
  /** Lấy promotions đang active của 1 hotel */
  getPromotionsByHotel: (hotelId) =>
    axiosClient.get(`/promotions/hotel/${hotelId}`),
};

export default publicApi;
