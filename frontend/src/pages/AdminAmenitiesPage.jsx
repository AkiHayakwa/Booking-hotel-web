import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import amenityApi from '../api/amenityApi';
import './AdminAmenitiesPage.css';

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    type: 'both',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await amenityApi.getAll();
      setAmenities(res.data || []);
    } catch (error) {
      console.error("Error fetching amenities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (amenity = null) => {
    if (amenity) {
      setEditingId(amenity._id);
      setFormData({
        name: amenity.name,
        icon: amenity.icon || '',
        type: amenity.type || 'both',
        description: amenity.description || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        icon: '',
        type: 'both',
        description: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await amenityApi.update(editingId, formData);
      } else {
        await amenityApi.create(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi lưu tiện nghi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa tiện nghi này?")) {
      try {
        await amenityApi.delete(id);
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa tiện nghi");
      }
    }
  };

  // Tính toán thống kê
  const totalItems = amenities.length;
  const itemsWithIcon = amenities.filter(a => a.icon).length;
  const itemsWithoutIcon = totalItems - itemsWithIcon;

  return (
    <AdminLayout activePath="/admin/amenities" searchPlaceholder="Tìm kiếm tiện nghi...">
      <div className="admin-amenities">
        <div className="admin-amenities__header">
          <div>
            <h2 className="admin-amenities__title">Quản lý Tiện nghi</h2>
            <p className="admin-amenities__subtitle">Quản lý các tiện ích nổi bật của khách sạn</p>
          </div>
          <button className="admin-amenities__add-btn" onClick={() => handleOpenModal()}>
            <span className="material-symbols-outlined">add</span>
            Thêm Tiện nghi
          </button>
        </div>

        {/* Stats Row */}
        <div className="admin-amenities__stats">
          <div className="admin-amenities__stat-card">
            <div className="admin-amenities__stat-icon admin-amenities__stat-icon--total">
              <span className="material-symbols-outlined">category</span>
            </div>
            <div>
              <p className="admin-amenities__stat-value">{totalItems}</p>
              <p className="admin-amenities__stat-label">Tổng tiện nghi</p>
            </div>
          </div>
          <div className="admin-amenities__stat-card">
            <div className="admin-amenities__stat-icon admin-amenities__stat-icon--icon">
              <span className="material-symbols-outlined">image</span>
            </div>
            <div>
              <p className="admin-amenities__stat-value">{itemsWithIcon}</p>
              <p className="admin-amenities__stat-label">Có Material Icon</p>
            </div>
          </div>
          <div className="admin-amenities__stat-card">
            <div className="admin-amenities__stat-icon admin-amenities__stat-icon--noicon">
              <span className="material-symbols-outlined">broken_image</span>
            </div>
            <div>
              <p className="admin-amenities__stat-value">{itemsWithoutIcon}</p>
              <p className="admin-amenities__stat-label">Chưa có Icon</p>
            </div>
          </div>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Icon Preview</th>
                  <th>Tên tiện nghi / Icon Code</th>
                  <th>Phân loại</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-8">Đang tải dữ liệu...</td></tr>
                ) : amenities.length > 0 ? (
                  amenities.map((a, idx) => (
                    <tr key={a._id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="amenity-icon-preview">
                          <span className="material-symbols-outlined">{a.icon || 'star'}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="amenity-name">{a.name}</p>
                          {a.icon ? (
                            <code className="amenity-icon-code">{a.icon}</code>
                          ) : (
                            <span className="amenity-icon-code" style={{ color: '#ef4444', backgroundColor: '#fef2f2'}}>Chưa cấu hình icon</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: a.type === 'hotel' ? '#e0f2fe' : a.type === 'room' ? '#fef3c7' : '#e0e7ff', color: a.type === 'hotel' ? '#0369a1' : a.type === 'room' ? '#b45309' : '#4338ca' }}>
                          {a.type === 'hotel' ? 'Khách sạn' : a.type === 'room' ? 'Phòng' : 'Chung'}
                        </div>
                      </td>
                      <td>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.description || '---'}
                        </p>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button className="admin-table-btn" title="Edit" onClick={() => handleOpenModal(a)}>
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="admin-table-btn admin-table-btn--danger" title="Delete" onClick={() => handleDelete(a._id)}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-8">Chưa có tiện nghi nào được tạo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>{editingId ? 'Chỉnh sửa Tiện nghi' : 'Thêm Tiện nghi mới'}</h3>
              <button className="admin-modal__close" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="admin-modal__form" onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Tên tiện nghi *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="VD: Hồ bơi vô cực"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Mã Material Icon (Tùy chọn)</label>
                  <input 
                    type="text" 
                    placeholder="VD: pool, local_cafe, wifi"
                    value={formData.icon} 
                    onChange={e => setFormData({...formData, icon: e.target.value.trim().toLowerCase()})} 
                  />
                  <div className="form-group__hint">
                    <span className="material-symbols-outlined" style={{fontSize: '1rem'}}>info</span>
                    Lấy mã icon tại <a href="https://fonts.google.com/icons?icon.set=Material+Symbols" target="_blank" rel="noreferrer">Google Fonts Icons</a>
                  </div>
                  
                    {formData.icon && (
                      <div className="icon-form-preview">
                        <span className="material-symbols-outlined">{formData.icon}</span>
                        <span>Preview Icon</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Phân loại tiện nghi *</label>
                    <select 
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="form-input"
                    >
                      <option value="both">Chung (Khách sạn & Phòng)</option>
                      <option value="hotel">Chỉ dùng cho Khách sạn</option>
                      <option value="room">Chỉ dùng cho Phòng</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Mô tả chi tiết</label>
                    <textarea 
                      rows="3"
                      className="form-input"
                      style={{height: 'auto', padding: '0.75rem', resize: 'vertical'}}
                      placeholder="Mô tả công dụng của tiện nghi này..."
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

              <div className="admin-modal__footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu Tiện nghi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
