import axiosClient from './axiosClient';

const bookingApi = {
  getAll: (params) => {
    return axiosClient.get('/bookings', { params });
  },
  getMyBookings: () => {
    return axiosClient.get('/bookings/my-bookings');
  },
  create: (data) => {
    return axiosClient.post('/bookings', data);
  },
  getById: (id) => {
    return axiosClient.get(`/bookings/${id}`);
  },
  confirm: (id) => {
    return axiosClient.patch(`/bookings/${id}/confirm`);
  },
  checkIn: (id) => {
    return axiosClient.patch(`/bookings/${id}/check-in`);
  },
  checkOut: (id) => {
    return axiosClient.patch(`/bookings/${id}/check-out`);
  },
  cancel: (id) => {
    return axiosClient.patch(`/bookings/${id}/cancel`);
  },
};

export default bookingApi;
