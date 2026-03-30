import axiosClient from './axiosClient';

const authApi = {
  login: (username, password) => {
    return axiosClient.post('/auth/login', { username, password });
  },
  googleLogin: (credential) => {
    return axiosClient.post('/auth/google', { credential });
  },
  // ===== ĐĂNG KÝ (OTP) =====
  sendOtp: (data) => {
    return axiosClient.post('/auth/send-otp', data);
  },
  verifyOtp: (email, otp) => {
    return axiosClient.post('/auth/verify-otp', { email, otp });
  },
  resendOtp: (email) => {
    return axiosClient.post('/auth/resend-otp', { email });
  },
  // ===== QUÊN MẬT KHẨU (OTP) =====
  forgotPassword: (email) => {
    return axiosClient.post('/auth/forgotpassword', { email });
  },
  verifyForgotOtp: (email, otp) => {
    return axiosClient.post('/auth/verify-forgot-otp', { email, otp });
  },
  resendForgotOtp: (email) => {
    return axiosClient.post('/auth/resend-forgot-otp', { email });
  },
  resetPassword: (email, newPassword) => {
    return axiosClient.post('/auth/reset-password', { email, newPassword });
  },
  // ===== KHÁC =====
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },
  getMe: () => {
    return axiosClient.get('/auth/me');
  },
  logout: () => {
    return axiosClient.post('/auth/logout');
  },
  changePassword: (oldpassword, newpassword) => {
    return axiosClient.post('/auth/changepassword', { oldpassword, newpassword });
  },
};

export default authApi;
