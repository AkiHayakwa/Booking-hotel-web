import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import hotelApi from '../api/hotelApi';
import statsApi from '../api/statsApi';
import './AdminHotelsPage.css';

const TABS = ['All Hotels', 'Active', 'Pending', 'Maintenance'];

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [stats, setStats] = useState({
    total: 0, approved: 0, pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Hotels');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    _id: '', name: '', description: '', address: '', 
    city: 'Da Nang', phone: '', email: '', imageUrl: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelsRes, statsRes] = await Promise.all([
        hotelApi.getAllAdmin(),
        statsApi.getAdminOverview()
      ]);
      
      if (hotelsRes.data) setHotels(hotelsRes.data);
      if (statsRes.data) {
        setStats({
          total: statsRes.data.totalHotels,
          approved: statsRes.data.approvedHotels,
          pending: statsRes.data.pendingHotels
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khách sạn:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const SUMMARY_STATS = [
    { icon: 'domain',       cls: 'accent',   label: 'Total Hotels',      value: stats.total.toLocaleString(), badge: '+4.2%', up: true },
    { icon: 'check_circle', cls: 'green',    label: 'Active Listings',    value: stats.approved.toLocaleString(), badge: '+2.1%', up: true },
    { icon: 'pending',      cls: 'yellow',   label: 'Pending Approval',   value: stats.pending.toLocaleString(), badge: 'New', up: true },
  ];

  const handleApprove = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn duyệt khách sạn này không?')) {
      try {
        await hotelApi.approve(id);
        fetchData();
      } catch (error) {
        alert('Lỗi khi duyệt khách sạn: ' + (error.response?.data || error.message));
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối khách sạn này không?')) {
      try {
        await hotelApi.reject(id);
        fetchData();
      } catch (error) {
        alert('Lỗi khi từ chối khách sạn: ' + (error.response?.data || error.message));
      }
    }
  };

  const handleDeleteHotel = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách sạn này không?')) {
      try {
        await hotelApi.delete(id);
        fetchData();
      } catch (error) {
        alert('Lỗi khi xóa khách sạn: ' + (error.response?.data || error.message));
      }
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({ 
      _id: '', name: '', description: '', address: '', 
      city: 'Da Nang', phone: '', email: '', imageUrl: '' 
    });
    setShowModal(true);
  };

  const openEditModal = (hotel) => {
    setIsEdit(true);
    setFormData({
      _id: hotel._id,
      name: hotel.name || '',
      description: hotel.description || '',
      address: hotel.address || '',
      city: hotel.city || 'Da Nang',
      phone: hotel.phone || '',
      email: hotel.email || '',
      imageUrl: hotel.images?.[0] || ''
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    const payload = {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      city: formData.city,
      phone: formData.phone,
      email: formData.email,
      images: formData.imageUrl ? [formData.imageUrl] : []
    };

    try {
      if (isEdit) {
        await hotelApi.update(formData._id, payload);
        alert('Cập nhật khách sạn thành công!');
      } else {
        await hotelApi.create(payload);
        alert('Tạo khách sạn thành công!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Lỗi khi lưu khách sạn: ' + (error.response?.data?.message || error.response?.data || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  const filtered = (hotels || []).filter(h => {
    const isPending = !h.isApproved && !h.isRejected;
    const status = isPending ? 'pending' : (h.isApproved ? 'active' : 'maintenance');
    
    const matchTab = activeTab === 'All Hotels' || 
                     (activeTab === 'Active' && status === 'active') ||
                     (activeTab === 'Pending' && status === 'pending') ||
                     (activeTab === 'Maintenance' && status === 'maintenance');

    const nameMatch = h.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = h.address?.city?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchTab && (nameMatch || cityMatch);
  });

  return (
    <AdminLayout 
      activePath="/admin/hotels" 
      searchPlaceholder="Search hotels by name or city..."
      onSearch={(val) => setSearchTerm(val)}
    >
      {/* Page Header */}
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h2 className="admin-page-header__title">Hotels ({filtered.length})</h2>
          <p className="admin-page-header__sub">Manage and monitor your global luxury inventory</p>
        </div>
        <button className="htl-add-btn" onClick={openAddModal}>
          <span className="material-symbols-outlined">add</span>
          Add New Hotel
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid htl-stats">
        {SUMMARY_STATS.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-card__top">
              <p className="admin-stat-card__label">{s.label}</p>
              <div className={`admin-stat-card__icon admin-stat-card__icon--${s.cls}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'baseline', gap:'0.5rem' }}>
              <p className="admin-stat-card__value">{loading ? '...' : s.value}</p>
              <span className={`admin-stat-card__badge admin-stat-card__badge--${s.up ? 'up' : 'down'}`}>
                <span className="material-symbols-outlined" style={{fontSize:'0.75rem'}}>{s.up ? 'trending_up' : 'trending_down'}</span>
                {s.badge}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="admin-table-card">
        <div className="admin-table-card__header">
          <div className="htl-tabs">
            {TABS.map(t => (
              <button
                key={t}
                className={`htl-tab${activeTab === t ? ' active' : ''}`}
                onClick={() => setActiveTab(t)}
              >{t}</button>
            ))}
          </div>
          <button className="admin-table-card__action">
            <span className="material-symbols-outlined">filter_list</span>
            Filter
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hotel Name</th><th>Location</th><th>Category</th>
                <th style={{textAlign:'center'}}>Rooms</th><th>Status</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="6" className="text-center">Đang tải dữ liệu...</td></tr>
              ) : filtered.map(h => {
                const isPending = !h.isApproved && !h.isRejected;
                const status = isPending ? 'pending' : (h.isApproved ? 'active' : 'maintenance');
                return (
                  <tr key={h._id}>
                    <td>
                      <div className="htl-name-cell">
                        <div className="htl-thumb">
                          <img src={h.images?.[0] || 'https://via.placeholder.com/150'} alt={h.name} />
                        </div>
                        <div>
                          <p className="htl-name">{h.name}</p>
                          <p className="htl-id">ID: #{h._id?.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="htl-location">{h.address?.city || 'Unknown'}</td>
                    <td><span className={`admin-badge admin-badge--hotel`}>Hotel</span></td>
                    <td style={{textAlign:'center'}} className="htl-rooms">{h.rooms?.length || 0}</td>
                    <td>
                      <div className={`admin-status admin-status--${status}`}>
                        <span className="admin-status__dot" />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </td>
                    <td>
                      <div className="admin-action-group" style={{justifyContent:'flex-end'}}>
                        {isPending && (
                          <>
                            <button className="admin-action-btn" title="Approve" onClick={() => handleApprove(h._id)}>
                              <span className="material-symbols-outlined">check_circle</span>
                            </button>
                            <button className="admin-action-btn admin-action-btn--delete" title="Reject" onClick={() => handleReject(h._id)}>
                              <span className="material-symbols-outlined">cancel</span>
                            </button>
                          </>
                        )}
                        <button 
                          className="admin-action-btn admin-action-btn--edit"
                          onClick={() => openEditModal(h)}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className="admin-action-btn admin-action-btn--view">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button className="admin-action-btn admin-action-btn--delete" onClick={() => handleDeleteHotel(h._id)}>
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="admin-pagination">
          <p className="admin-pagination__info">
            Showing <strong>1</strong> to <strong>{filtered.length}</strong> of <strong>{hotels.length}</strong> entries
          </p>
          <div className="admin-pagination__controls">
            <button className="admin-pagination__btn" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="admin-pagination__btn active">1</button>
            <button className="admin-pagination__btn">Next</button>
          </div>
        </div>
      </div>

      {/* ── Modal Thêm/Sửa Khách Sạn ── */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{isEdit ? 'Edit Hotel' : 'Add New Hotel'}</h3>
              <p className="admin-modal-sub">
                {isEdit ? 'Update hotel information.' : 'Register a new property to your platform.'}
              </p>
            </div>
            
            <form onSubmit={handleSaveHotel}>
              <div className="admin-form-group">
                <label className="admin-form-label">Hotel Name *</label>
                <input 
                  type="text" name="name" className="admin-form-input" 
                  value={formData.name} onChange={handleChange} 
                  required placeholder="e.g. Grand Plaza Resort"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">City *</label>
                  <select 
                    name="city" className="admin-form-select" 
                    value={formData.city} onChange={handleChange} required
                  >
                    <option value="Da Nang">Đà Nẵng</option>
                    <option value="Ha Noi">Hà Nội</option>
                    <option value="Ho Chi Minh">Hồ Chí Minh</option>
                    <option value="Nha Trang">Nha Trang</option>
                    <option value="Da Lat">Đà Lạt</option>
                    <option value="Phu Quoc">Phú Quốc</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Phone *</label>
                  <input 
                    type="text" name="phone" className="admin-form-input" 
                    value={formData.phone} onChange={handleChange} 
                    required placeholder="0123.456.789"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Address *</label>
                <input 
                  type="text" name="address" className="admin-form-input" 
                  value={formData.address} onChange={handleChange} 
                  required placeholder="123 Ocean Drive"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email *</label>
                <input 
                  type="email" name="email" className="admin-form-input" 
                  value={formData.email} onChange={handleChange} 
                  required placeholder="hotel@example.com"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Image URL</label>
                <input 
                  type="url" name="imageUrl" className="admin-form-input" 
                  value={formData.imageUrl} onChange={handleChange} 
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea 
                  name="description" className="admin-form-textarea" 
                  value={formData.description} onChange={handleChange} 
                  placeholder="Tell us about the property..."
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-submit" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
