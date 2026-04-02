import axiosClient from './axiosClient';

const paymentApi = {
  createMomoPayment: (bookingId, amount) => {
    return axiosClient.post('/payments/momo', { bookingId, amount });
  }
};

export default paymentApi;
