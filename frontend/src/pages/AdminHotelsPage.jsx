import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import hotelApi from '../api/hotelApi';
import statsApi from '../api/statsApi';
import userApi from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import uploadApi from '../api/uploadApi';
import './AdminHotelsPage.css';

const TABS = ['All Hotels', 'Active', 'Pending', 'Maintenance'];

const VN_CITIES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", 
  "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", 
  "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", 
  "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", 
  "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", 
  "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", 
  "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", 
  "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái", "Hồ Chí Minh"
];

const getStreetsForCity = (city = '') => {
  const normalized = city.toLowerCase();
  if (normalized.includes('hà nội')) return ['Nguyễn Trãi', 'Cầu Giấy', 'Kim Mã', 'Láng Hạ', 'Trần Duy Hưng', 'Hoàng Hoa Thám'];
  if (normalized.includes('hồ chí minh')) return ['Nguyễn Huệ', 'Lê Lợi', 'Đồng Khởi', 'Điện Biên Phủ', 'Võ Văn Kiệt', 'Phạm Văn Đồng'];
  if (normalized.includes('đà nẵng')) return ['Bạch Đằng', 'Trần Phú', 'Nguyễn Văn Linh', 'Lê Duẩn', 'Võ Nguyên Giáp'];
  return ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Hùng Vương', 'Nguyễn Thái Học', 'Điện Biên Phủ', 'Quang Trung'];
};

export default function AdminHotelsPage() {
  const { user: currentUser } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [owners, setOwners] = useState([]);
  const [stats, setStats] = useState({
    total: 0, approved: 0, pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Hotels');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    _id: '', name: '', description: '', address: '', 
    city: 'Da Nang', phone: '', email: '', images: [],
    owner: ''
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    
    try {
      const uploadPromises = files.map(file => uploadApi.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      const newUrls = results.map(res => res.data?.url).filter(Boolean);
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newUrls] }));
    } catch (err) {
      alert("Có lỗi xảy ra khi tải ảnh lên.");
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

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

  const fetchOwners = async () => {
    try {
      const res = await userApi.getByRole('hotel_owner');
      if (res.data) setOwners(res.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách chủ sở hữu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    if (currentUser?.role?.name === 'admin') {
      fetchOwners();
    }
  }, [currentUser]);

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
      city: 'Da Nang', phone: '', email: '', images: [],
      owner: '' 
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
      images: hotel.images ? [...hotel.images] : [],
      owner: hotel.owner?._id || hotel.owner || ''
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
      images: formData.images,
      owner: formData.owner
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

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const currentData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationArray = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }
    return pages;
  };

  return (
    <AdminLayout 
      activePath="/admin/hotels" 
      searchPlaceholder="Search hotels by name or city..."
      onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
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
                onClick={() => { setActiveTab(t); setCurrentPage(1); }}
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
                <th>Hotel Name</th><th>Location</th><th>Owner</th>
                <th style={{textAlign:'center'}}>Rooms</th><th>Status</th>
                <th style={{textAlign:'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                 <tr><td colSpan="6" className="text-center">Đang tải dữ liệu...</td></tr>
              ) : currentData.length === 0 ? (
                 <tr><td colSpan="6" className="text-center">Không có dữ liệu</td></tr>
              ) : currentData.map(h => {
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
                    <td className="htl-location">{h.city || 'Unknown'}</td>
                    <td className="htl-owner">{h.owner?.fullName || h.owner?.username || 'N/A'}</td>
                    <td style={{textAlign:'center'}} className="htl-rooms">{h.roomCount || 0}</td>
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
            Showing <strong>{filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of <strong>{filtered.length}</strong> entries
          </p>
          {totalPages > 1 && (
            <div className="admin-pagination__controls">
              <button 
                type="button"
                className="admin-pagination__btn" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              {getPaginationArray().map((item, idx) => (
                item === '...' ? (
                  <span key={`sep-${idx}`} className="admin-pagination__sep">...</span>
                ) : (
                  <button 
                    type="button"
                    key={item}
                    className={`admin-pagination__btn ${currentPage === item ? 'active' : ''}`}
                    onClick={() => handlePageChange(item)}
                  >
                    {item}
                  </button>
                )
              ))}
              
              <button 
                type="button"
                className="admin-pagination__btn" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
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
              {currentUser?.role?.name === 'admin' && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Hotel Owner *</label>
                  <select 
                    name="owner" className="admin-form-select" 
                    value={formData.owner} onChange={handleChange} required
                  >
                    <option value="">-- Choose Hotel Owner --</option>
                    {owners.map(o => (
                      <option key={o._id} value={o._id}>
                        {o.fullName || o.username} ({o.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  <input 
                    type="text" name="city" className="admin-form-input" 
                    list="vietnam_cities"
                    value={formData.city} onChange={handleChange} required
                    placeholder="Chọn hoặc nhập tên thành phố"
                  />
                  <datalist id="vietnam_cities">
                    {VN_CITIES.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Phone *</label>
                  <input 
                    type="text" name="phone" className="admin-form-input" 
                    value={formData.phone} onChange={handleChange} 
                    required placeholder="0901234567"
                    pattern="^\d{10,11}$"
                    title="Số điện thoại phải bao gồm 10-11 chữ số"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Address *</label>
                <input 
                  type="text" name="address" className="admin-form-input" 
                  list="suggested_streets"
                  value={formData.address} onChange={handleChange} 
                  required placeholder="Số nhà, tên đường phố..."
                />
                <datalist id="suggested_streets">
                  {getStreetsForCity(formData.city).map(s => <option key={s} value={s} />)}
                </datalist>
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
                <label className="admin-form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Hotel Images</span>
                  <label className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', background: '#0284c7', color: '#fff', borderRadius: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{uploadingImages ? 'sync' : 'add_photo_alternate'}</span>
                    {uploadingImages ? 'Uploading...' : 'Upload Images'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                      disabled={uploadingImages}
                    />
                  </label>
                </label>
                
                {formData.images && formData.images.length > 0 ? (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {formData.images.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Remove this image"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ marginTop: '10px', padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}>image</span>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No images uploaded yet.</p>
                  </div>
                )}
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Description *</label>
                <textarea 
                  name="description" className="admin-form-textarea" 
                  value={formData.description} onChange={handleChange} 
                  placeholder="Tell us about the property..."
                  required minLength={10}
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
