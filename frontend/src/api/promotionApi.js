import axiosClient from './axiosClient';

const promotionApi = {
  getAll: () => {
    return axiosClient.get('/promotions');
  },
  getAllAdmin: () => {
    return axiosClient.get('/promotions/admin/all');
  },
  getByHotel: (hotelId) => {
    return axiosClient.get(`/promotions/hotel/${hotelId}`);
  },
  getById: (id) => {
    return axiosClient.get(`/promotions/${id}`);
  },
  create: (data) => {
    return axiosClient.post('/promotions', data);
  },
  update: (id, data) => {
    return axiosClient.put(`/promotions/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/promotions/${id}`);
  },
  validate: (data) => {
    return axiosClient.post('/promotions/validate', data);
  }
};

export default promotionApi;
