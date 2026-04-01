import { useState, useEffect } from 'react';
import OwnerLayout from '../components/OwnerLayout';
import { useOwner } from '../context/OwnerContext';
import ownerApi from '../api/ownerApi';
import './OwnerHotelPage.css';

/* ─── Helpers ──────────────────────────────────────── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

/* ─── Stars ─────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <span className="ohp-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className="material-symbols-outlined"
          style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0', fontSize: '0.95rem' }}>
          star
        </span>
      ))}
      <b style={{ fontSize: '0.875rem', color: '#f59e0b', marginLeft: 4 }}>{Number(rating).toFixed(1)}</b>
    </span>
  );
}

/* ─── Toast ─────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  return (
    <div className={`owner-toast${type === 'error' ? ' owner-toast--error' : ''}`}>
      <span className="material-symbols-outlined">
        {type === 'error' ? 'error' : 'check_circle'}
      </span>
      {msg}
    </div>
  );
}

/* ─── CreateHotelModal ──────────────────────────────── */
function CreateHotelModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', city: '', address: '', phone: '', email: '', imageUrl: '', description: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const payload = {
        name:        form.name.trim(),
        city:        form.city.trim(),
        address:     form.address.trim(),
        phone:       form.phone.trim(),
        email:       form.email.trim(),
        description: form.description.trim(),
        images:      form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      };
      await ownerApi.createHotel(payload);
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'Tạo thất bại, vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal ohp-create-modal">
        <button className="admin-modal-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Tạo khách sạn mới</h3>
          <p className="admin-modal-sub">Sau khi tạo, khách sạn sẽ chờ Admin phê duyệt</p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8,
            padding: '0.6rem 1rem', color: '#b91c1c', fontSize: '0.85rem',
            margin: '0 1.5rem 0.5rem', display: 'flex', gap: '0.4rem', alignItems: 'center',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ohp-modal-form">
          {/* Tên + Thành phố */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Tên khách sạn *</label>
              <input type="text" className="admin-form-input" required
                value={form.name} onChange={e => setField('name', e.target.value)}
                placeholder="VD: Grand Plaza Resort" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Thành phố *</label>
              <input type="text" className="admin-form-input" required
                value={form.city} onChange={e => setField('city', e.target.value)}
                placeholder="VD: Đà Nẵng" />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="admin-form-group">
            <label className="admin-form-label">Địa chỉ *</label>
            <input type="text" className="admin-form-input" required
              value={form.address} onChange={e => setField('address', e.target.value)}
              placeholder="VD: 123 Bãi Biển Mỹ Khê" />
          </div>

          {/* Phone + Email */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Điện thoại</label>
              <input type="tel" className="admin-form-input"
                value={form.phone} onChange={e => setField('phone', e.target.value)}
                placeholder="0123.456.789" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Email liên hệ</label>
              <input type="email" className="admin-form-input"
                value={form.email} onChange={e => setField('email', e.target.value)}
                placeholder="hotel@example.com" />
            </div>
          </div>

          {/* Ảnh bìa URL */}
          <div className="admin-form-group">
            <label className="admin-form-label">URL ảnh bìa</label>
            <input type="url" className="admin-form-input"
              value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)}
              placeholder="https://images.unsplash.com/..." />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview"
                className="ohp-img-preview"
                onError={e => e.target.style.display = 'none'} />
            )}
          </div>

          {/* Mô tả */}
          <div className="admin-form-group">
            <label className="admin-form-label">Mô tả</label>
            <textarea className="admin-form-textarea" rows={3}
              value={form.description} onChange={e => setField('description', e.target.value)}
              placeholder="Giới thiệu về khách sạn của bạn..." />
          </div>

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-cancel" onClick={onClose} disabled={creating}>
              Hủy
            </button>
            <button type="submit" className="admin-btn-submit" disabled={creating}>
              {creating
                ? <><span className="ohp-btn-spin" /> Đang tạo...</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>add_business</span> Tạo khách sạn</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══ MAIN PAGE ════════════════════════════════════════ */
export default function OwnerHotelPage() {
  const { hotel, hotelId, loading: ctxLoading, refreshHotel } = useOwner();

  const [amenities, setAmenities]         = useState([]);
  const [saving, setSaving]               = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast]                 = useState(null);

  /* ── Form state (edit) ── */
  const [form, setForm] = useState({
    name: '', description: '', address: '', city: '',
    phone: '', email: '', imageUrl: '', amenities: [],
  });

  /* ── Sync form khi hotel thay đổi ── */
  useEffect(() => {
    if (hotel) {
      setForm({
        name:        hotel.name        || '',
        description: hotel.description || '',
        address:     hotel.address     || '',
        city:        hotel.city        || '',
        phone:       hotel.phone       || '',
        email:       hotel.email       || '',
        imageUrl:    hotel.images?.[0] || '',
        amenities:   (hotel.amenities || []).map(a => a._id || a),
      });
    }
  }, [hotel]);

  /* ── Fetch tiện nghi (background) ── */
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

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAmenity = (id) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(id)
        ? f.amenities.filter(x => x !== id)
        : [...f.amenities, id],
    }));
  };

  const openModal  = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  /* ── Save (edit) ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name:        form.name,
        description: form.description,
        address:     form.address,
        city:        form.city,
        phone:       form.phone,
        email:       form.email,
        images:      form.imageUrl ? [form.imageUrl] : hotel?.images || [],
        amenities:   form.amenities,
      };
      await ownerApi.updateHotel(hotelId, payload);
      refreshHotel?.();
      flash('Cập nhật thành công!');
      closeModal();
    } catch (err) {
      flash(err?.response?.data?.message || 'Lưu thất bại, thử lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Handler sau khi tạo KS thành công ── */
  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    await refreshHotel?.();
    flash('✅ Đã gửi yêu cầu. Vui lòng chờ Admin phê duyệt.');
  };

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  /* ── Case 0: Context đang loading ── */
  if (ctxLoading) return (
    <OwnerLayout>
      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
        Đang tải...
      </div>
    </OwnerLayout>
  );

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  /* ── Case ①: Chưa có khách sạn → Empty-state + form tạo mới ── */
  if (!hotel) return (
    <OwnerLayout>
      {/* Empty State Card */}
      <div className="ohp-create-wrapper">
        <div className="ohp-create-card">
          <div className="ohp-create-icon">
            <span className="material-symbols-outlined">hotel</span>
          </div>
          <h2>Bạn chưa có khách sạn</h2>
          <p>
            Tạo khách sạn để bắt đầu nhận đặt phòng trên LuxStay.<br />
            Sau khi tạo, khách sạn sẽ chờ <b>Admin phê duyệt</b> trước khi hoạt động.
          </p>
          <button
            id="btn-create-hotel"
            className="ohp-create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="material-symbols-outlined">add_business</span>
            Tạo khách sạn ngay
          </button>
        </div>
      </div>

      {/* Modal tạo KS */}
      {showCreateModal && (
        <CreateHotelModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </OwnerLayout>
  );

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  /* ── Case ② & ③: Đã có KS (pending hoặc approved) ── */
  const selectedAmenIds = new Set(form.amenities);

  return (
    <OwnerLayout searchPlaceholder="Tìm kiếm...">

      {/* ── Case ②: Banner vàng nếu chờ duyệt ── */}
      {!hotel.isApproved && (
        <div className="ohp-pending-banner">
          <span className="material-symbols-outlined">schedule</span>
          <span>
            <b>Đang chờ Admin phê duyệt.</b>{' '}
            Một số tính năng chưa khả dụng cho đến khi khách sạn được duyệt.
            {hotel.createdAt && ` · Gửi yêu cầu: ${fmtDate(hotel.createdAt)}`}
          </span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h2 className="admin-page-header__title">Khách sạn của tôi</h2>
          <p className="admin-page-header__sub">Xem và chỉnh sửa thông tin khách sạn</p>
        </div>
        <button className="htl-add-btn" onClick={openModal}>
          <span className="material-symbols-outlined">edit</span>
          Chỉnh sửa
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="admin-stats-grid htl-stats">
        {[
          { icon: 'domain',      cls: 'accent',  label: 'Tên khách sạn', value: hotel.name },
          { icon: 'location_on', cls: 'blue',    label: 'Thành phố',     value: hotel.city || '—' },
          { icon: 'star',        cls: 'yellow',  label: 'Đánh giá',      value: hotel.rating ? `${Number(hotel.rating).toFixed(1)} / 5` : '—' },
          {
            icon: 'verified',
            cls: hotel.isApproved ? 'green' : 'gray',
            label: 'Trạng thái',
            value: hotel.isApproved ? 'Đã duyệt' : 'Chờ duyệt',
          },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-card__top">
              <p className="admin-stat-card__label">{s.label}</p>
              <div className={`admin-stat-card__icon admin-stat-card__icon--${s.cls}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
            </div>
            <p className="admin-stat-card__value" style={{ fontSize: '1rem' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main Info Card ── */}
      <div className="admin-table-card">
        <div className="admin-table-card__header">
          <h3 className="admin-table-card__title">Thông tin chi tiết</h3>
          <button className="admin-table-card__action" onClick={openModal}>
            <span className="material-symbols-outlined">edit</span>
            Chỉnh sửa
          </button>
        </div>

        <div className="ohp-detail-body">

          {/* Ảnh + Info cơ bản */}
          <div className="ohp-detail-top">
            <div className="ohp-cover-wrap">
              {hotel.images?.[0]
                ? <img className="ohp-cover-img" src={hotel.images[0]} alt={hotel.name} />
                : <div className="ohp-cover-placeholder">
                    <span className="material-symbols-outlined">image</span>
                    <p>Chưa có ảnh</p>
                  </div>
              }
              <span className={`ohp-status-pill ${hotel.isApproved ? 'ohp-status-pill--ok' : 'ohp-status-pill--pending'}`}>
                <span className="material-symbols-outlined">{hotel.isApproved ? 'verified' : 'schedule'}</span>
                {hotel.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
              </span>
            </div>

            <div className="ohp-info-list">
              {[
                { icon: 'hotel',          label: 'Tên KS',            value: hotel.name },
                { icon: 'location_city',  label: 'Thành phố',         value: hotel.city },
                { icon: 'map',            label: 'Địa chỉ',           value: hotel.address },
                { icon: 'call',           label: 'Điện thoại',        value: hotel.phone || '—' },
                { icon: 'mail',           label: 'Email',             value: hotel.email || '—' },
                { icon: 'calendar_today', label: 'Ngày tạo',          value: fmtDate(hotel.createdAt) },
                { icon: 'update',         label: 'Cập nhật lần cuối', value: fmtDate(hotel.updatedAt) },
              ].map(r => (
                <div key={r.label} className="ohp-info-row">
                  <span className="material-symbols-outlined ohp-info-icon">{r.icon}</span>
                  <span className="ohp-info-label">{r.label}</span>
                  <span className="ohp-info-value">{r.value}</span>
                </div>
              ))}
              {hotel.rating > 0 && (
                <div className="ohp-info-row">
                  <span className="material-symbols-outlined ohp-info-icon">star</span>
                  <span className="ohp-info-label">Đánh giá</span>
                  <Stars rating={hotel.rating} />
                </div>
              )}
            </div>
          </div>

          {/* Mô tả */}
          {hotel.description && (
            <div className="ohp-desc-section">
              <p className="ohp-desc-title">
                <span className="material-symbols-outlined">description</span>
                Mô tả khách sạn
              </p>
              <p className="ohp-desc-text">{hotel.description}</p>
            </div>
          )}

          {/* Tiện nghi */}
          {hotel.amenities?.length > 0 && (
            <div className="ohp-desc-section">
              <p className="ohp-desc-title">
                <span className="material-symbols-outlined">spa</span>
                Tiện nghi ({hotel.amenities.length})
              </p>
              <div className="ohp-amenity-wrap">
                {hotel.amenities.map(a => (
                  <span key={a._id || a} className="ohp-amenity-tag">
                    {a.icon && <span className="material-symbols-outlined" style={{fontSize:'0.95rem'}}>{a.icon}</span>}
                    {a.name || a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ảnh gallery */}
          {hotel.images?.length > 1 && (
            <div className="ohp-desc-section">
              <p className="ohp-desc-title">
                <span className="material-symbols-outlined">photo_library</span>
                Hình ảnh ({hotel.images.length} ảnh)
              </p>
              <div className="ohp-img-gallery">
                {hotel.images.map((url, i) => (
                  <div key={i} className="ohp-gallery-item">
                    <img src={url} alt={`Ảnh ${i + 1}`} />
                    {i === 0 && <span className="ohp-cover-badge">Ảnh bìa</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══ Modal Chỉnh sửa ══════════════════════════════ */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal ohp-modal">
            <button className="admin-modal-close" onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Chỉnh sửa thông tin KS</h3>
              <p className="admin-modal-sub">Cập nhật thông tin khách sạn của bạn</p>
            </div>

            <form onSubmit={handleSave} className="ohp-modal-form">
              {/* Tên + Thành phố */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Tên khách sạn *</label>
                  <input type="text" className="admin-form-input" required
                    value={form.name} onChange={e => setField('name', e.target.value)}
                    placeholder="VD: Grand Plaza Resort" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Thành phố *</label>
                  <input type="text" className="admin-form-input" required
                    value={form.city} onChange={e => setField('city', e.target.value)}
                    placeholder="VD: Đà Nẵng" />
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="admin-form-group">
                <label className="admin-form-label">Địa chỉ *</label>
                <input type="text" className="admin-form-input" required
                  value={form.address} onChange={e => setField('address', e.target.value)}
                  placeholder="VD: 123 Bãi Biển Mỹ Khê" />
              </div>

              {/* Phone + Email */}
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Điện thoại</label>
                  <input type="tel" className="admin-form-input"
                    value={form.phone} onChange={e => setField('phone', e.target.value)}
                    placeholder="0123.456.789" />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Email liên hệ</label>
                  <input type="email" className="admin-form-input"
                    value={form.email} onChange={e => setField('email', e.target.value)}
                    placeholder="hotel@example.com" />
                </div>
              </div>

              {/* Ảnh bìa URL */}
              <div className="admin-form-group">
                <label className="admin-form-label">URL ảnh bìa</label>
                <input type="url" className="admin-form-input"
                  value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)}
                  placeholder="https://images.unsplash.com/..." />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview"
                    className="ohp-img-preview"
                    onError={e => e.target.style.display = 'none'} />
                )}
              </div>

              {/* Mô tả */}
              <div className="admin-form-group">
                <label className="admin-form-label">Mô tả</label>
                <textarea className="admin-form-textarea" rows={4}
                  value={form.description} onChange={e => setField('description', e.target.value)}
                  placeholder="Giới thiệu về khách sạn của bạn..." />
              </div>

              {/* Tiện nghi */}
              {amenities.length > 0 && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Tiện nghi</label>
                  <div className="ohp-amenity-picker">
                    {amenities.filter(a => !a.isDeleted).map(a => (
                      <label
                        key={a._id}
                        className={`ohp-amenity-chip${selectedAmenIds.has(a._id) ? ' selected' : ''}`}
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
                <button type="button" className="admin-btn-cancel" onClick={closeModal} disabled={saving}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn-submit" disabled={saving}>
                  {saving
                    ? <><span className="ohp-btn-spin" /> Đang lưu...</>
                    : 'Lưu thay đổi'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </OwnerLayout>
  );
}
