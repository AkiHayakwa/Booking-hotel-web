import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import blogApi from '../api/blogApi';
import './AdminBlogsPage.css';

const CATEGORIES = [
  { value: 'news', label: 'Tin tức' },
  { value: 'travel_tips', label: 'Cẩm nang du lịch' },
  { value: 'hotel_info', label: 'Thông tin khách sạn' },
  { value: 'promotion', label: 'Khuyến mãi' },
  { value: 'review', label: 'Đánh giá' }
];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    thumbnail: '',
    category: 'news',
    tags: '',
    isPublished: false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await blogApi.getAllAdmin();
      setBlogs(res.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingId(blog._id);
      setFormData({
        title: blog.title,
        content: blog.content,
        thumbnail: blog.thumbnail || '',
        category: blog.category,
        tags: blog.tags?.join(', ') || '',
        isPublished: blog.isPublished
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        content: '',
        thumbnail: '',
        category: 'news',
        tags: '',
        isPublished: false
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    try {
      if (editingId) {
        await blogApi.update(editingId, payload);
      } else {
        await blogApi.create(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi lưu bài viết");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        await blogApi.delete(id);
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa bài viết");
      }
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await blogApi.togglePublish(id);
      fetchData();
    } catch (error) {
      alert("Lỗi khi thay đổi trạng thái xuất bản");
    }
  };

  return (
    <AdminLayout activePath="/admin/blogs" searchPlaceholder="Tìm kiếm bài viết...">
      <div className="admin-blogs">
        <div className="admin-blogs__header">
          <div>
            <h2 className="admin-blogs__title">Quản lý Bài viết</h2>
            <p className="admin-blogs__subtitle">Viết và quản lý các bài blog du lịch</p>
          </div>
          <button className="admin-blogs__add-btn" onClick={() => handleOpenModal()}>
            <span className="material-symbols-outlined">add</span>
            Tạo Bài viết mới
          </button>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Tiêu đề / Tác giả</th>
                  <th>Danh mục</th>
                  <th>Ngày tạo</th>
                  <th>Lượt bình luận</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-8">Đang tải dữ liệu...</td></tr>
                ) : blogs.length > 0 ? (
                  blogs.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div className="blog-thumb">
                          <img src={b.thumbnail || 'https://via.placeholder.com/100x60?text=No+Thumb'} alt={b.title} />
                        </div>
                      </td>
                      <td>
                        <div className="blog-info">
                          <p className="blog-name">{b.title}</p>
                          <span className="blog-author">Bởi {b.author?.fullName || 'Admin'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="blog-category">
                          {CATEGORIES.find(c => c.value === b.category)?.label || b.category}
                        </span>
                      </td>
                      <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td>{b.commentCount || 0}</td>
                      <td>
                        <div className="publish-toggle" onClick={() => handleTogglePublish(b._id)}>
                          <span className={`admin-badge admin-badge--${b.isPublished ? 'active' : 'pending'}`}>
                            {b.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button className="admin-table-btn" title="Edit" onClick={() => handleOpenModal(b)}>
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="admin-table-btn admin-table-btn--danger" title="Delete" onClick={() => handleDelete(b._id)}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center py-8">Chưa có bài viết nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal admin-modal--large">
            <div className="admin-modal__header">
              <h3>{editingId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h3>
              <button className="admin-modal__close" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="admin-modal__form" onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Tiêu đề bài viết *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Danh mục *</label>
                  <select 
                    required 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Thẻ tag (Phân cách bằng dấu phẩy)</label>
                  <input 
                    type="text" 
                    placeholder="VD: du lịch, đà nẵng, nghỉ dưỡng"
                    value={formData.tags} 
                    onChange={e => setFormData({...formData, tags: e.target.value})} 
                  />
                </div>
                <div className="form-group full-width">
                  <label>Link ảnh bìa (Thumbnail URL)</label>
                  <input 
                    type="text" 
                    value={formData.thumbnail} 
                    onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
                  />
                </div>
                <div className="form-group full-width">
                  <label>Nội dung bài viết *</label>
                  <textarea 
                    rows="10" 
                    required
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    placeholder="Viết nội dung bài viết ở đây..."
                  ></textarea>
                </div>
                <div className="form-group checkbox">
                   <label>
                     <input 
                       type="checkbox" 
                       checked={formData.isPublished}
                       onChange={e => setFormData({...formData, isPublished: e.target.checked})}
                     />
                     Xuất bản ngay
                   </label>
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu bài viết</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
