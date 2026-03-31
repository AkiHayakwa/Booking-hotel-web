import axiosClient from './axiosClient';

const userApi = {
  getAll: (params) => {
    return axiosClient.get('/users', { params });
  },
  getById: (id) => {
    return axiosClient.get(`/users/${id}`);
  },
  update: (id, data) => {
    return axiosClient.put(`/users/${id}`, data);
  },
  toggleStatus: (id) => {
    return axiosClient.patch(`/users/${id}/toggle-active`);
  },
  changeRole: (id, roleId) => {
    return axiosClient.put(`/users/${id}`, { role: roleId });
  },
  delete: (id) => {
    return axiosClient.delete(`/users/${id}`);
  },
};

export default userApi;
