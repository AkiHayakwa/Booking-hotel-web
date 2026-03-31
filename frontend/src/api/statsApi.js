import axiosClient from './axiosClient';

const statsApi = {
  getAdminOverview: () => {
    return axiosClient.get('/stats/admin-overview');
  },
  // Có thể thêm các hàm lấy biểu đồ doanh thu theo tháng tại đây
};

export default statsApi;
