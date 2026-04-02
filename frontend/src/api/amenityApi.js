import axiosClient from './axiosClient';

const amenityApi = {
  getAll: () => {
    return axiosClient.get('/amenities');
  },
  create: (data) => {
    return axiosClient.post('/amenities', data);
  },
  update: (id, data) => {
    return axiosClient.put(`/amenities/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/amenities/${id}`);
  }
};

export default amenityApi;
