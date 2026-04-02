import { useState, useEffect } from 'react';
import OwnerLayout from '../components/OwnerLayout';
import { useOwner } from '../context/OwnerContext';
import ownerApi from '../api/ownerApi';
import uploadApi from '../api/uploadApi';
import './OwnerHotelPage.css';

/* ─── Helpers ─────────────────────────── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtPrice = (n) => Number(n || 0).toLocaleString('vi-VN');

/* ─── Stars ──────────────────────────── */
function Stars({ rating }) {
  return (
    <span className="ohp-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className="material-symbols-outlined"
          style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0', fontSize: '0.95rem' }}>
          star
        </span>
      ))}
      <b style={{ fontSize: '0.875rem', color: '#f59e0b', marginLeft: 4 }}>
        {Number(rating).toFixed(1)}
      </b>
    </span>
  );
}

/* ─── Toast ──────────────────────────── */
function Toast({ msg, type }) {
  return (
    <div className={`owner-toast${type === 'error' ? ' owner-toast--error' : ''}`}>
      <span className="material-symbols-outlined">
        {type === 'error' ? 'error' : 'check_circle'}
      </span>
      {msg}
    </div>
  );
}

/* ─── HotelFormModal (Tạo / Sửa dùng chung) ── */
const BLANK = { name:'', city:'', address:'', phone:'', email:'', imageUrl:'', description:'', amenities:[] };

function HotelFormModal({ editTarget, amenities, onClose, onSaved }) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState(
    isEdit
      ? {
          name:        editTarget.name        || '',
          city:        editTarget.city        || '',
          address:     editTarget.address     || '',
          phone:       editTarget.phone       || '',
          email:       editTarget.email       || '',
          images:      editTarget.images ? [...editTarget.images] : [],
          description: editTarget.description || '',
          amenities:   (editTarget.amenities || []).map(a => a._id || a),
        }
      : { ...BLANK, images: [] }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImages(true);
    
    try {
      const uploadPromises = files.map(file => uploadApi.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      const newUrls = results.map(res => res.data?.url).filter(Boolean);
      setForm(f => ({ ...f, images: [...(f.images || []), ...newUrls] }));
    } catch (err) {
      setError("Có lỗi xảy ra khi tải ảnh lên.");
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    setForm(f => ({
      ...f,
      images: f.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (id) =>
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(id)
        ? f.amenities.filter(x => x !== id)
        : [...f.amenities, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      name:        form.name.trim(),
      city:        form.city.trim(),
      address:     form.address.trim(),
      phone:       form.phone.trim(),
      email:       form.email.trim(),
      description: form.description.trim(),
      images:      form.images,
      amenities:   form.amenities,
    };
    try {
      if (isEdit) {
        await ownerApi.updateHotel(editTarget._id, payload);
        onSaved('Cập nhật khách sạn thành công!');
      } else {
        await ownerApi.createHotel(payload);
        onSaved('✅ Đã gửi yêu cầu tạo KS. Vui lòng chờ Admin phê duyệt.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || (isEdit ? 'Cập nhật thất bại.' : 'Tạo thất bại, thử lại.'));
    } finally {
      setSaving(false);
    }
  };

  const selectedIds = new Set(form.amenities);

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal ohp-modal">
        <button className="admin-modal-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            {isEdit ? 'Chỉnh sửa khách sạn' : 'Thêm khách sạn mới'}
          </h3>
          <p className="admin-modal-sub">
            {isEdit
              ? 'Cập nhật thông tin khách sạn của bạn'
              : 'Sau khi tạo, khách sạn sẽ chờ Admin phê duyệt'}
          </p>
        </div>

        {error && (
          <div style={{
            background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8,
            padding:'0.6rem 1rem', color:'#b91c1c', fontSize:'0.85rem',
            margin:'0 1.5rem 0.5rem', display:'flex', gap:'0.4rem', alignItems:'center'
          }}>
            <span className="material-symbols-outlined" style={{fontSize:'1rem'}}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ohp-modal-form">
          {/* Tên + Thành phố */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Tên khách sạn *</label>
              <input type="text" className="admin-form-input" required
                value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="VD: Grand Plaza Resort" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Thành phố *</label>
              <input type="text" className="admin-form-input" required
                value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="VD: Đà Nẵng" />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="admin-form-group">
            <label className="admin-form-label">Địa chỉ *</label>
            <input type="text" className="admin-form-input" required
              value={form.address} onChange={e => set('address', e.target.value)}
              placeholder="VD: 123 Bãi Biển Mỹ Khê" />
          </div>

          {/* Phone + Email */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Điện thoại</label>
              <input type="tel" className="admin-form-input"
                value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="0123.456.789" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Email liên hệ</label>
              <input type="email" className="admin-form-input"
                value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="hotel@example.com" />
            </div>
          </div>

          {/* Ảnh KS */}
          <div className="admin-form-group">
            <label className="admin-form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Hình ảnh khách sạn</span>
              <label className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{uploadingImages ? 'sync' : 'add_photo_alternate'}</span>
                {uploadingImages ? 'Đang tải...' : 'Upload ảnh'}
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
            
            {form.images && form.images.length > 0 ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {form.images.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title="Xóa ảnh này"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: '10px', padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}>image</span>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Chưa có hình ảnh nào. Hãy thêm ảnh phòng nghỉ hoặc ngoại cảnh khách sạn.</p>
              </div>
            )}
            
          </div>

          {/* Mô tả */}
          <div className="admin-form-group">
            <label className="admin-form-label">Mô tả</label>
            <textarea className="admin-form-textarea" rows={3}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Giới thiệu về khách sạn..." />
          </div>

          {/* Tiện nghi */}
          {amenities.length > 0 && (
            <div className="admin-form-group">
              <label className="admin-form-label">Tiện nghi</label>
              <div className="ohp-amenity-picker">
                {amenities.filter(a => !a.isDeleted).map(a => (
                  <label key={a._id}
                    className={`ohp-amenity-chip${selectedIds.has(a._id) ? ' selected' : ''}`}
                    onClick={() => toggleAmenity(a._id)}
                  >
                    {a.icon && <span className="material-symbols-outlined" style={{fontSize:'1rem'}}>{a.icon}</span>}
                    {a.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-cancel" onClick={onClose} disabled={saving}>Hủy</button>
            <button type="submit" className="admin-btn-submit" disabled={saving}>
              {saving
                ? <><span className="ohp-btn-spin" />{isEdit ? 'Đang lưu...' : 'Đang tạo...'}</>
                : isEdit ? 'Lưu thay đổi' : 'Tạo khách sạn'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── HotelCard ─────────────────────── */
function HotelCard({ h, onEdit, onSelect, isSelected }) {
  return (
    <div className={`ohp-hotel-card${isSelected ? ' ohp-hotel-card--active' : ''}`}>
      {/* Cover */}
      <div className="ohp-hotel-card__cover">
        {h.images?.[0]
          ? <img src={h.images[0]} alt={h.name} />
          : (
            <div className="ohp-hotel-card__cover-placeholder">
              <span className="material-symbols-outlined">hotel</span>
            </div>
          )
        }
        <span className={`ohp-status-pill ${h.isApproved ? 'ohp-status-pill--ok' : 'ohp-status-pill--pending'}`}>
          <span className="material-symbols-outlined">{h.isApproved ? 'verified' : 'schedule'}</span>
          {h.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
        </span>
        {isSelected && (
          <span className="ohp-hotel-card__selected-badge">
            <span className="material-symbols-outlined">check_circle</span>
            Đang quản lý
          </span>
        )}
      </div>

      {/* Info */}
      <div className="ohp-hotel-card__body">
        <p className="ohp-hotel-card__name">{h.name}</p>
        <p className="ohp-hotel-card__city">
          <span className="material-symbols-outlined">location_on</span>
          {h.city} — {h.address}
        </p>

        <div className="ohp-hotel-card__meta">
          {h.rating > 0 && (
            <span className="ohp-hotel-card__meta-item">
              <span className="material-symbols-outlined" style={{color:'#f59e0b'}}>star</span>
              {Number(h.rating).toFixed(1)}
            </span>
          )}
          <span className="ohp-hotel-card__meta-item">
            <span className="material-symbols-outlined" style={{color:'#0891b2'}}>spa</span>
            {h.amenities?.length || 0} tiện nghi
          </span>
          {h.phone && (
            <span className="ohp-hotel-card__meta-item">
              <span className="material-symbols-outlined" style={{color:'#0891b2'}}>call</span>
              {h.phone}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="ohp-hotel-card__actions">
        {!isSelected && (
          <button className="ohp-hotel-card__btn ohp-hotel-card__btn--select" onClick={() => onSelect(h._id)}>
            <span className="material-symbols-outlined">manage_accounts</span>
            Quản lý KS này
          </button>
        )}
        <button className="ohp-hotel-card__btn ohp-hotel-card__btn--edit" onClick={() => onEdit(h)}>
          <span className="material-symbols-outlined">edit</span>
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
}

/* ══ MAIN PAGE ════════════════════════════════ */
export default function OwnerHotelPage() {
  const { hotels, selectedHotelId, setSelectedHotelId, loading: ctxLoading, refreshHotels, refreshHotel } = useOwner();

  const [amenities, setAmenities] = useState([]);
  const [toast, setToast]         = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = tạo mới, object = sửa

  /* ── Load tiện nghi ── */
  useEffect(() => {
    ownerApi.getAmenities()
      .then(res => { if (res?.data) setAmenities(res.data); })
      .catch(() => {});
  }, []);

  /* ── Helpers ── */
  const flash = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit   = (h) => { setEditTarget(h);   setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSaved = async (msg) => {
    closeModal();
    await (refreshHotels || refreshHotel)?.();
    flash(msg);
  };

  /* ── Loading ── */
  if (ctxLoading) return (
    <OwnerLayout>
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Đang tải...</div>
    </OwnerLayout>
  );

  /* ── Pending Banner (nếu KS đang chọn chưa duyệt) ── */
  const selectedHotel = hotels.find(h => h._id === selectedHotelId) || null;
  const showPendingBanner = selectedHotel && !selectedHotel.isApproved;

  return (
    <OwnerLayout searchPlaceholder="Tìm kiếm khách sạn...">

      {/* ── Pending banner ── */}
      {showPendingBanner && (
        <div className="ohp-pending-banner">
          <span className="material-symbols-outlined">schedule</span>
          <span>
            <b>"{selectedHotel.name}" đang chờ Admin phê duyệt.</b>{' '}
            Một số tính năng chưa khả dụng.
            {selectedHotel.createdAt && ` · Gửi yêu cầu: ${fmtDate(selectedHotel.createdAt)}`}
          </span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h2 className="admin-page-header__title">Quản lý khách sạn</h2>
          <p className="admin-page-header__sub">
            Bạn đang quản lý <b>{hotels.length}</b> khách sạn
          </p>
        </div>
        <button className="htl-add-btn" id="btn-add-hotel" onClick={openCreate}>
          <span className="material-symbols-outlined">add_business</span>
          Thêm khách sạn
        </button>
      </div>

      {/* ── Stats Strip ── */}
      <div className="admin-stats-grid htl-stats">
        {[
          {
            icon: 'domain',
            cls: 'accent',
            label: 'Tổng khách sạn',
            value: hotels.length,
          },
          {
            icon: 'verified',
            cls: 'green',
            label: 'Đã duyệt',
            value: hotels.filter(h => h.isApproved).length,
          },
          {
            icon: 'schedule',
            cls: 'gray',
            label: 'Chờ duyệt',
            value: hotels.filter(h => !h.isApproved).length,
          },
          {
            icon: 'star',
            cls: 'yellow',
            label: 'Đánh giá TB',
            value: (() => {
              const rated = hotels.filter(h => h.rating > 0);
              if (!rated.length) return '—';
              return (rated.reduce((s, h) => s + h.rating, 0) / rated.length).toFixed(1) + ' / 5';
            })(),
          },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-card__top">
              <p className="admin-stat-card__label">{s.label}</p>
              <div className={`admin-stat-card__icon admin-stat-card__icon--${s.cls}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
            </div>
            <p className="admin-stat-card__value" style={{ fontSize: '1.3rem' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Hotel Grid hoặc Empty State ── */}
      {hotels.length === 0 ? (
        <div className="ohp-create-wrapper">
          <div className="ohp-create-card">
            <div className="ohp-create-icon">
              <span className="material-symbols-outlined">hotel</span>
            </div>
            <h2>Bạn chưa có khách sạn nào</h2>
            <p>
              Thêm khách sạn để bắt đầu nhận đặt phòng trên LuxStay.<br />
              Sau khi tạo, khách sạn sẽ chờ <b>Admin phê duyệt</b>.
            </p>
            <button className="ohp-create-btn" onClick={openCreate}>
              <span className="material-symbols-outlined">add_business</span>
              Thêm khách sạn ngay
            </button>
          </div>
        </div>
      ) : (
        <div className="ohp-hotels-grid">
          {hotels.map(h => (
            <HotelCard
              key={h._id}
              h={h}
              isSelected={h._id === selectedHotelId}
              onEdit={openEdit}
              onSelect={setSelectedHotelId}
            />
          ))}

          {/* Card "+ Thêm KS" */}
          <button className="ohp-hotel-card ohp-hotel-card--add" onClick={openCreate}>
            <span className="material-symbols-outlined">add_circle</span>
            <p>Thêm khách sạn mới</p>
          </button>
        </div>
      )}

      {/* ── Modal Tạo / Sửa ── */}
      {showModal && (
        <HotelFormModal
          editTarget={editTarget}
          amenities={amenities}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </OwnerLayout>
  );
}
