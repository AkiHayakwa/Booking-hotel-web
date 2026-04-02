import axiosClient from './axiosClient';

const reviewApi = {
  // Dành cho khách hàng xem review của chính họ
  getMyReviews: () => {
    return axiosClient.get('/reviews/my-reviews');
  },
  
  // Lấy review cho các trang chi tiết KS
  getByHotel: (hotelId) => {
    return axiosClient.get(`/reviews/hotel/${hotelId}`);
  },

  // Lấy các booking đủ điều kiện đánh giá (đã checkout, chưa review)
  getEligibleBookings: (hotelId) => {
    return axiosClient.get(`/reviews/eligible/${hotelId}`);
  },

  // Tạo review mới (dành cho customer)
  create: (data) => {
    return axiosClient.post('/reviews', data);
  },

  // Dành riêng cho ADMIN
  getAllAdmin: () => {
    return axiosClient.get('/reviews/admin/all');
  },
  
  // Dành riêng cho ADMIN xóa review
  deleteAdmin: (id) => {
    return axiosClient.delete(`/reviews/${id}`);
  }
};

export default reviewApi;
