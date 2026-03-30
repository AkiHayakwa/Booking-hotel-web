import axiosClient from './axiosClient';

const hotelApi = {
  getAll: (params) => {
    return axiosClient.get('/hotels', { params });
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
  delete: (id) => {
    return axiosClient.delete(`/hotels/${id}`);
  },
};

export default hotelApi;
