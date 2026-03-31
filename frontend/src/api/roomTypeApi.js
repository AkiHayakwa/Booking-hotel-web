import axiosClient from './axiosClient';

const roomTypeApi = {
  // Lấy tất cả loại phòng
  getAll: () => {
    return axiosClient.get('/room-types');
  },

  // Lấy loại phòng theo Khách sạn (Hotel ID)
  getAllByHotel: (hotelId) => {
    return axiosClient.get(`/room-types/hotel/${hotelId}`);
  },

  // Tạo loại phòng mới cho một Khách sạn (Hotel ID)
  create: (hotelId, data) => {
    return axiosClient.post(`/room-types/${hotelId}`, data);
  },

  // Cập nhật loại phòng
  update: (id, data) => {
    return axiosClient.put(`/room-types/${id}`, data);
  },

  // Xóa loại phòng
  delete: (id) => {
    return axiosClient.delete(`/room-types/${id}`);
  }
};

export default roomTypeApi;
