import axiosClient from './axiosClient';

const blogApi = {
  getAll: () => {
    return axiosClient.get('/blogs');
  },
  getAllAdmin: () => {
    return axiosClient.get('/blogs/admin/all');
  },
  getBySlug: (slug) => {
    return axiosClient.get(`/blogs/${slug}`);
  },
  create: (data) => {
    return axiosClient.post('/blogs', data);
  },
  update: (id, data) => {
    return axiosClient.put(`/blogs/${id}`, data);
  },
  delete: (id) => {
    return axiosClient.delete(`/blogs/${id}`);
  },
  togglePublish: (id) => {
    return axiosClient.patch(`/blogs/${id}/publish`);
  },
  getComments: (blogId) => {
    return axiosClient.get(`/blogs/${blogId}/comments`);
  },
  createComment: (blogId, data) => {
    return axiosClient.post(`/blogs/${blogId}/comments`, data);
  },
  replyComment: (blogId, commentId, data) => {
    return axiosClient.post(`/blogs/${blogId}/comments/${commentId}/reply`, data);
  },
  updateComment: (blogId, commentId, data) => {
    return axiosClient.put(`/blogs/${blogId}/comments/${commentId}`, data);
  },
  deleteComment: (blogId, commentId) => {
    return axiosClient.delete(`/blogs/${blogId}/comments/${commentId}`);
  }
};

export default blogApi;
