import { useState, useEffect, useCallback } from 'react';
import OwnerLayout from '../components/OwnerLayout';
import { useOwner } from '../context/OwnerContext';
import ownerApi from '../api/ownerApi';
import uploadApi from '../api/uploadApi';
import './OwnerPromotionsPage.css';

/* ─── helpers ─────────────────────────────────── */
const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN');
const fmtPrice = (n) => Number(n).toLocaleString('vi-VN') + ' ₫';

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

function ConfirmDialog({ title, onConfirm, onCancel, loading }) {
  return (
    <div className="ort-confirm-overlay">
      <div className="ort-confirm-box">
        <div className="ort-confirm-icon">
          <span className="material-symbols-outlined">delete_forever</span>
        </div>
        <h4>Xóa ưu đãi?</h4>
        <p>
          Bạn sắp xóa <b>"{title}"</b>.<br />
          Hành động này không thể hoàn tác.
        </p>
        <div className="ort-confirm-actions">
          <button className="ort-confirm-btn ort-confirm-btn--cancel" onClick={onCancel} disabled={loading}>Hủy</button>
          <button className="ort-confirm-btn ort-confirm-btn--delete" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Form Tạo / Sửa ưu đãi ──────────── */
const BLANK = {
  title: '', description: '', promoCode: '', thumbnail: '',
  discountType: 'percentage', discountValue: '',
  startDate: '', endDate: '',
  minNights: 1, maxUsage: '',
  applicableRoomTypes: [],
  isActive: true,
};

function toInputDate(d) {
  if (!d) return '';
  return new Date(d).toISOString().split('T')[0];
}

function PromoModal({ editTarget, onClose, onSaved, hotelId }) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState(
    isEdit
      ? {
          title: editTarget.title || '',
          description: editTarget.description || '',
          thumbnail: editTarget.thumbnail || '',
          promoCode: editTarget.promoCode || '',
          discountType: editTarget.discountType || 'percentage',
          discountValue: editTarget.discountValue || '',
          startDate: toInputDate(editTarget.startDate),
          endDate: toInputDate(editTarget.endDate),
          minNights: editTarget.minNights || 1,
          maxUsage: editTarget.maxUsage || '',
          applicableRoomTypes: (editTarget.applicableRoomTypes || []).map(rt => typeof rt === 'object' ? rt._id : rt),
          isActive: editTarget.isActive ?? true,
        }
      : { ...BLANK }
  );
  const [roomTypes, setRoomTypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!hotelId) return;
    ownerApi.getRoomTypes(hotelId).then(res => {
      setRoomTypes(Array.isArray(res.data) ? res.data.filter(r => !r.isDeleted) : []);
    }).catch(() => {});
  }, [hotelId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setForm(f => ({ ...f, thumbnail: res.data.url }));
    } catch (err) {
      setError("Lỗi tải ảnh lên.");
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const toggleRoomType = (rtId) => {
    setForm(f => {
      const arr = f.applicableRoomTypes;
      return { ...f, applicableRoomTypes: arr.includes(rtId) ? arr.filter(x => x !== rtId) : [...arr, rtId] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      thumbnail: form.thumbnail,
      promoCode: form.promoCode.trim() || undefined,
      hotel: hotelId,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      startDate: form.startDate,
      endDate: form.endDate,
      minNights: Number(form.minNights) || 1,
      maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
      applicableRoomTypes: form.applicableRoomTypes,
      isActive: form.isActive,
    };
    try {
      if (isEdit) {
        await ownerApi.updatePromotion(editTarget._id, payload);
      } else {
        await ownerApi.createPromotion(payload);
      }
      onSaved(isEdit ? 'Cập nhật ưu đãi thành công!' : 'Thêm ưu đãi thành công!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal ohp-modal" style={{ maxWidth: 620 }}>
        <button className="admin-modal-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            {isEdit ? 'Chỉnh sửa ưu đãi' : 'Thêm ưu đãi mới'}
          </h3>
          <p className="admin-modal-sub">
            {isEdit ? 'Cập nhật thông tin chương trình ưu đãi' : 'Tạo chương trình ưu đãi mới cho khách sạn'}
          </p>
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

        <form onSubmit={handleSubmit} style={{ padding: '0 1.5rem 1.5rem' }}>
          {/* Tên + Mã */}
          <div className="admin-form-row">
            <div className="admin-form-group" style={{ flex: 2 }}>
              <label className="admin-form-label">Tên ưu đãi *</label>
              <input type="text" className="admin-form-input" required
                value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="VD: Giảm 20% mùa hè" />
            </div>
            <div className="admin-form-group" style={{ flex: 1 }}>
              <label className="admin-form-label">Mã giảm giá</label>
              <input type="text" className="admin-form-input"
                value={form.promoCode} onChange={e => set('promoCode', e.target.value.toUpperCase())}
                placeholder="VD: SUMMER20" />
            </div>
          </div>

          {/* Ảnh Thumbnail */}
          <div className="admin-form-group">
            <label className="admin-form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Ảnh Thumbnail</span>
              <label className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', background: '#0284c7', color: '#fff', borderRadius: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{uploadingImage ? 'sync' : 'add_photo_alternate'}</span>
                {uploadingImage ? 'Đang tải...' : 'Upload ảnh'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleThumbnailUpload} 
                  style={{ display: 'none' }} 
                  disabled={uploadingImage}
                />
              </label>
            </label>
            {form.thumbnail ? (
              <div style={{ position: 'relative', width: '150px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                <img src={form.thumbnail} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => setForm(f => ({ ...f, thumbnail: '' }))}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '10px', padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2rem', marginBottom: '8px', opacity: 0.5 }}>image</span>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Chưa có thumbnail.</p>
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div className="admin-form-group">
            <label className="admin-form-label">Mô tả</label>
            <textarea className="admin-form-textarea" rows={2}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Mô tả ngắn về chương trình..." />
          </div>

          {/* Loại giảm + Giá trị */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Loại giảm *</label>
              <select className="admin-form-input" value={form.discountType}
                onChange={e => set('discountType', e.target.value)}>
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed_amount">Số tiền cố định (₫)</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">
                Giá trị giảm * {form.discountType === 'percentage' ? '(%)' : '(₫)'}
              </label>
              <input type="number" className="admin-form-input" required min="0"
                value={form.discountValue} onChange={e => set('discountValue', e.target.value)}
                placeholder={form.discountType === 'percentage' ? 'VD: 20' : 'VD: 200000'} />
            </div>
          </div>

          {/* Ngày */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Ngày bắt đầu *</label>
              <input type="date" className="admin-form-input" required
                value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Ngày kết thúc *</label>
              <input type="date" className="admin-form-input" required
                value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>

          {/* Đêm tối thiểu + Giới hạn sử dụng */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Đêm tối thiểu</label>
              <input type="number" className="admin-form-input" min="1"
                value={form.minNights} onChange={e => set('minNights', e.target.value)} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Giới hạn sử dụng</label>
              <input type="number" className="admin-form-input" min="0"
                value={form.maxUsage} onChange={e => set('maxUsage', e.target.value)}
                placeholder="Không giới hạn" />
            </div>
          </div>

          {/* Áp dụng cho loại phòng */}
          {roomTypes.length > 0 && (
            <div className="admin-form-group">
              <label className="admin-form-label">Áp dụng cho loại phòng (bỏ trống = tất cả)</label>
              <div className="opp-rt-chips">
                {roomTypes.map(rt => {
                  const sel = form.applicableRoomTypes.includes(rt._id);
                  return (
                    <button type="button" key={rt._id}
                      className={`opp-rt-chip ${sel ? 'opp-rt-chip--active' : ''}`}
                      onClick={() => toggleRoomType(rt._id)}>
                      {sel && <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check</span>}
                      {rt.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toggle Active */}
          <div className="admin-form-group opp-toggle-group">
            <label className="opp-toggle">
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
              <span className="opp-toggle__slider" />
            </label>
            <span className="admin-form-label" style={{ marginBottom: 0 }}>Kích hoạt ngay</span>
          </div>

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-cancel" onClick={onClose} disabled={saving}>Hủy</button>
            <button type="submit" className="admin-btn-submit" disabled={saving}>
              {saving
                ? <><span className="ort-btn-spin" />{isEdit ? 'Đang lưu...' : 'Đang tạo...'}</>
                : isEdit ? 'Lưu thay đổi' : 'Thêm ưu đãi'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══ MAIN PAGE ═══════════════════════════════ */
export default function OwnerPromotionsPage() {
  const { hotels, selectedHotelId } = useOwner();
  const [activeHotelId, setActiveHotelId] = useState(selectedHotelId || '');

  useEffect(() => {
    if (selectedHotelId && !activeHotelId) setActiveHotelId(selectedHotelId);
  }, [selectedHotelId]);

  const activeHotel = hotels.find(h => h._id === activeHotelId) || null;

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState('');

  const fetchPromos = useCallback(async () => {
    if (!activeHotelId) { setPromos([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await ownerApi.getPromotions(activeHotelId);
      setPromos(Array.isArray(res.data) ? res.data.filter(p => !p.isDeleted) : []);
    } catch {
      flash('Không thể tải danh sách ưu đãi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeHotelId]);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const flash = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (p) => { setEditTarget(p); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSaved = (msg) => { closeModal(); flash(msg); fetchPromos(); };

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await ownerApi.deletePromotion(confirmTarget._id);
      setConfirmTarget(null);
      flash('Đã xóa ưu đãi.');
      fetchPromos();
    } catch {
      flash('Xóa thất bại.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Derived ── */
  const now = new Date();
  const activeCount = promos.filter(p => p.isActive && new Date(p.endDate) >= now).length;
  const expiredCount = promos.filter(p => new Date(p.endDate) < now).length;

  const filtered = promos.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.promoCode || '').toLowerCase().includes(q);
  });

  const getStatus = (p) => {
    if (!p.isActive) return { label: 'Tắt', cls: 'opp-badge--off' };
    if (new Date(p.endDate) < now) return { label: 'Hết hạn', cls: 'opp-badge--expired' };
    if (new Date(p.startDate) > now) return { label: 'Sắp tới', cls: 'opp-badge--upcoming' };
    return { label: 'Đang chạy', cls: 'opp-badge--active' };
  };

  return (
    <OwnerLayout searchPlaceholder="Tìm ưu đãi..." onSearch={setSearch}>
      {/* Header */}
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h2 className="admin-page-header__title">Ưu đãi</h2>
          <p className="admin-page-header__sub">Quản lý chương trình khuyến mãi cho khách sạn</p>
        </div>
        <button className="ort-add-btn" onClick={openCreate} disabled={!activeHotelId}>
          <span className="material-symbols-outlined">add</span>
          Thêm ưu đãi
        </button>
      </div>

      {/* Hotel Selector */}
      <div className="ort-hotel-selector">
        <span className="material-symbols-outlined ort-hotel-selector__icon">domain</span>
        <div className="ort-hotel-selector__inner">
          <label className="ort-hotel-selector__label">Khách sạn</label>
          <select className="ort-hotel-selector__select" value={activeHotelId}
            onChange={e => setActiveHotelId(e.target.value)}>
            {hotels.length === 0 && <option value="">Chưa có khách sạn</option>}
            {hotels.map(h => (
              <option key={h._id} value={h._id}>
                {h.name} — {h.city}{!h.isApproved ? ' ⏳' : ' ✅'}
              </option>
            ))}
          </select>
        </div>
        {activeHotel && (
          <span className={`ort-hotel-selector__badge ${activeHotel.isApproved ? 'ort-hotel-selector__badge--ok' : 'ort-hotel-selector__badge--pending'}`}>
            <span className="material-symbols-outlined">{activeHotel.isApproved ? 'verified' : 'schedule'}</span>
            {activeHotel.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="admin-stats-grid ort-stats">
        {[
          { icon: 'local_offer', cls: 'accent', label: 'Tổng ưu đãi', value: promos.length },
          { icon: 'play_circle', cls: 'green', label: 'Đang hoạt động', value: activeCount },
          { icon: 'timer_off', cls: 'yellow', label: 'Đã hết hạn', value: expiredCount },
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

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', animation: 'ort-spin 1s linear infinite', display: 'block' }}>
            progress_activity
          </span>
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Đang tải...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ort-empty">
          <span className="material-symbols-outlined">local_offer</span>
          <h3>{promos.length === 0 ? 'Chưa có ưu đãi nào' : 'Không tìm thấy kết quả'}</h3>
          <p>{promos.length === 0 ? 'Tạo chương trình ưu đãi đầu tiên cho khách sạn.' : 'Thử từ khóa khác.'}</p>
          {promos.length === 0 && (
            <button className="ort-add-btn" onClick={openCreate} style={{ marginTop: '0.5rem' }}>
              <span className="material-symbols-outlined">add</span>
              Thêm ưu đãi ngay
            </button>
          )}
        </div>
      ) : (
        <div className="opp-table-wrap">
          <table className="opp-table">
            <thead>
              <tr>
                <th>Tên ưu đãi</th>
                <th>Mã</th>
                <th>Giảm giá</th>
                <th>Thời gian</th>
                <th>Sử dụng</th>
                <th>Trạng thái</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const st = getStatus(p);
                return (
                  <tr key={p._id}>
                    <td>
                      <div className="opp-cell-title">{p.title}</div>
                      {p.description && <div className="opp-cell-desc">{p.description}</div>}
                    </td>
                    <td>
                      {p.promoCode
                        ? <span className="opp-code">{p.promoCode}</span>
                        : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td>
                      <strong>
                        {p.discountType === 'percentage' ? `${p.discountValue}%` : fmtPrice(p.discountValue)}
                      </strong>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {fmtDate(p.startDate)} → {fmtDate(p.endDate)}
                      </div>
                    </td>
                    <td>
                      {p.usedCount || 0}{p.maxUsage ? ` / ${p.maxUsage}` : ''}
                    </td>
                    <td>
                      <span className={`opp-badge ${st.cls}`}>{st.label}</span>
                    </td>
                    <td>
                      <div className="opp-actions">
                        <button className="opp-action-btn" title="Sửa" onClick={() => openEdit(p)}>
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className="opp-action-btn opp-action-btn--del" title="Xóa" onClick={() => setConfirmTarget(p)}>
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
      )}

      {/* Modal */}
      {showModal && (
        <PromoModal
          editTarget={editTarget}
          hotelId={activeHotelId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm Delete */}
      {confirmTarget && (
        <ConfirmDialog
          title={confirmTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setConfirmTarget(null)}
          loading={deleting}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </OwnerLayout>
  );
}
