import axiosClient from './axiosClient';

const hotelApi = {
  getAll: (params) => {
    return axiosClient.get('/hotels', { params });
  },
  getAllAdmin: () => {
    return axiosClient.get('/hotels/admin/all');
  },
  getById: (id) => {
    return axiosClient.get(`/hotels/${id}`);
  },
  create: (data) => {
    return axiosClient.post('/hotels', data);
  },
  update: (id, data) => {
    return axiosClient.put(`/hotels/${id}`, data);
  },
  approve: (id) => {
    return axiosClient.patch(`/hotels/${id}/approve`);
  },
  reject: (id) => {
    return axiosClient.patch(`/hotels/${id}/reject`);
  },
  delete: (id) => {
    return axiosClient.delete(`/hotels/${id}`);
  },
};

export default hotelApi;
