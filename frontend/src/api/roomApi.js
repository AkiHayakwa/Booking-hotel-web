import axiosClient from './axiosClient';

const roomApi = {
  // Lấy danh sách phòng theo Khách sạn (Hotel ID)
  getAllByHotel: (hotelId) => {
    return axiosClient.get(`/rooms/hotel/${hotelId}`);
  },

  // Lấy danh sách phòng trống theo ngày checkin/checkout và số khách
  getAvailable: (hotelId, checkIn, checkOut, guests) => {
    return axiosClient.get(`/rooms/available/${hotelId}`, {
      params: { checkIn, checkOut, guests }
    });
  },

  // Lõi tạo phòng mới theo Khách sạn (Hotel ID)
  create: (hotelId, data) => {
    return axiosClient.post(`/rooms/${hotelId}`, data);
  },

  // Cập nhật thông tin phòng vật lý
  update: (id, data) => {
    return axiosClient.put(`/rooms/${id}`, data);
  },

  // Xóa phòng
  delete: (id) => {
    return axiosClient.delete(`/rooms/${id}`);
  },

  // Đổi trạng thái (Available / Occupied / Maintenance)
  updateStatus: (id, status) => {
    return axiosClient.patch(`/rooms/${id}/status`, { status });
  }
};

export default roomApi;
