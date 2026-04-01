import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import promotionApi from '../api/promotionApi';
import hotelApi from '../api/hotelApi';
import './AdminPromotionsPage.css';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    hotel: '',
    discountType: 'percentage',
    discountValue: 0,
    startDate: '',
    endDate: '',
    promoCode: '',
    isActive: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [promoRes, hotelRes] = await Promise.all([
        promotionApi.getAllAdmin(),
        hotelApi.getAll()
      ]);
      setPromotions(promoRes.data || []);
      setHotels(hotelRes.data || []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingId(promo._id);
      setFormData({
        title: promo.title,
        description: promo.description,
        thumbnail: promo.thumbnail || '',
        hotel: promo.hotel?._id || promo.hotel,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
        endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
        promoCode: promo.promoCode || '',
        isActive: promo.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        hotel: hotels[0]?._id || '',
        discountType: 'percentage',
        discountValue: 0,
        startDate: '',
        endDate: '',
        promoCode: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await promotionApi.update(editingId, formData);
      } else {
        await promotionApi.create(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi lưu ưu đãi");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa ưu đãi này?")) {
      try {
        await promotionApi.delete(id);
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa ưu đãi");
      }
    }
  };

  return (
    <AdminLayout activePath="/admin/promotions" searchPlaceholder="Tìm kiếm ưu đãi...">
      <div className="admin-promos">
        <div className="admin-promos__header">
          <div>
            <h2 className="admin-promos__title">Quản lý Ưu đãi</h2>
            <p className="admin-promos__subtitle">Chỉnh sửa và tạo các chương trình giảm giá</p>
          </div>
          <button className="admin-promos__add-btn" onClick={() => handleOpenModal()}>
            <span className="material-symbols-outlined">add</span>
            Tạo Ưu đãi mới
          </button>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tiêu đề / Code</th>
                  <th>Khách sạn</th>
                  <th>Giảm giá</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-8">Đang tải dữ liệu...</td></tr>
                ) : promotions.length > 0 ? (
                  promotions.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="promo-thumb">
                          <img src={p.thumbnail || 'https://via.placeholder.com/100x60?text=No+Image'} alt={p.title} />
                        </div>
                      </td>
                      <td>
                        <div className="promo-info">
                          <p className="promo-name">{p.title}</p>
                          <code className="promo-code">{p.promoCode || 'N/A'}</code>
                        </div>
                      </td>
                      <td>{p.hotel?.name || '---'}</td>
                      <td>
                        <span className="promo-discount">
                          {p.discountType === 'percentage' ? `${p.discountValue}%` : `${p.discountValue.toLocaleString()}đ`}
                        </span>
                      </td>
                      <td>
                        <div className="promo-dates">
                          <span>{new Date(p.startDate).toLocaleDateString()}</span>
                          <span className="material-symbols-outlined">arrow_forward</span>
                          <span>{new Date(p.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${p.isActive ? 'active' : 'pending'}`}>
                          {p.isActive ? 'Đang chạy' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button className="admin-table-btn" title="Edit" onClick={() => handleOpenModal(p)}>
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="admin-table-btn admin-table-btn--danger" title="Delete" onClick={() => handleDelete(p._id)}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center py-8">Chưa có ưu đãi nào được tạo.</td></tr>
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
              <h3>{editingId ? 'Chỉnh sửa Ưu đãi' : 'Thêm Ưu đãi mới'}</h3>
              <button className="admin-modal__close" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="admin-modal__form" onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Tiêu đề ưu đãi *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Mã Code (Tùy chọn)</label>
                  <input 
                    type="text" 
                    placeholder="VD: SUMMER30"
                    value={formData.promoCode} 
                    onChange={e => setFormData({...formData, promoCode: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Khách sạn áp dụng *</label>
                  <select 
                    required 
                    value={formData.hotel} 
                    onChange={e => setFormData({...formData, hotel: e.target.value})}
                  >
                    <option value="">-- Chọn khách sạn --</option>
                    {hotels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Loại giảm giá</label>
                  <select 
                    value={formData.discountType} 
                    onChange={e => setFormData({...formData, discountType: e.target.value})}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá trị giảm *</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.discountValue} 
                    onChange={e => setFormData({...formData, discountValue: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                  />
                </div>
                <div className="form-group full-width">
                  <label>Link ảnh thumbnail</label>
                  <input 
                    type="text" 
                    value={formData.thumbnail} 
                    onChange={e => setFormData({...formData, thumbnail: e.target.value})} 
                  />
                </div>
                <div className="form-group full-width">
                  <label>Mô tả chi tiết</label>
                  <textarea 
                    rows="3" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="form-group checkbox">
                   <label>
                     <input 
                       type="checkbox" 
                       checked={formData.isActive}
                       onChange={e => setFormData({...formData, isActive: e.target.checked})}
                     />
                     Kích hoạt ngay
                   </label>
                </div>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Lưu Ưu đãi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
