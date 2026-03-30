import axiosClient from './axiosClient';

const authApi = {
  login: (username, password) => {
    return axiosClient.post('/auth/login', { username, password });
  },
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },
  getMe: () => {
    return axiosClient.get('/auth/me');
  },
  logout: () => {
    return axiosClient.post('/auth/logout');
  },
  forgotPassword: (email) => {
    return axiosClient.post('/auth/forgotpassword', { email });
  },
  changePassword: (oldpassword, newpassword) => {
    return axiosClient.post('/auth/changepassword', { oldpassword, newpassword });
  },
};

export default authApi;
