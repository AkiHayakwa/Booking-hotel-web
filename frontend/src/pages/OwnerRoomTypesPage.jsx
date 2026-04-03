import { useState, useEffect, useCallback } from 'react';
import OwnerLayout from '../components/OwnerLayout';
import { useOwner } from '../context/OwnerContext';
import ownerApi from '../api/ownerApi';
import uploadApi from '../api/uploadApi';
import './OwnerRoomTypesPage.css';

/* ─── Format tiền VNĐ ──────────────────────── */
const fmtPrice = (n) =>
  Number(n).toLocaleString('vi-VN') + ' ₫';

/* ─── Toast ─────────────────────────────────── */
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

/* ─── ConfirmDialog ──────────────────────────── */
function ConfirmDialog({ name, onConfirm, onCancel, loading }) {
  return (
    <div className="ort-confirm-overlay">
      <div className="ort-confirm-box">
        <div className="ort-confirm-icon">
          <span className="material-symbols-outlined">delete_forever</span>
        </div>
        <h4>Xóa loại phòng?</h4>
        <p>
          Bạn sắp xóa <b>"{name}"</b>.<br />
          Hành động này không thể hoàn tác.
        </p>
        <div className="ort-confirm-actions">
          <button className="ort-confirm-btn ort-confirm-btn--cancel" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
          <button className="ort-confirm-btn ort-confirm-btn--delete" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── RoomTypeCard ───────────────────────────── */
function RoomTypeCard({ rt, onEdit, onDelete }) {
  const hasImage = rt.images && rt.images.length > 0;
  return (
    <div className="ort-card">
      {hasImage
        ? <img className="ort-card__thumb" src={rt.images[0]} alt={rt.name}
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
        : null
      }
      {!hasImage && (
        <div className="ort-card__thumb--placeholder">
          <span className="material-symbols-outlined">hotel_class</span>
          <span>Chưa có ảnh</span>
        </div>
      )}

      <div className="ort-card__body">
        <p className="ort-card__name">{rt.name}</p>
        <p className="ort-card__price">
          {fmtPrice(rt.pricePerNight)}
          <span>/ đêm</span>
        </p>
        <div className="ort-card__meta">
          <span className="ort-card__meta-item">
            <span className="material-symbols-outlined">group</span>
            {rt.maxGuests} khách tối đa
          </span>
        </div>
        {rt.description && (
          <p className="ort-card__desc">{rt.description}</p>
        )}
      </div>

      <div className="ort-card__actions">
        <button className="ort-card__btn ort-card__btn--edit" onClick={() => onEdit(rt)}>
          <span className="material-symbols-outlined">edit</span>
          Sửa
        </button>
        <button className="ort-card__btn ort-card__btn--delete" onClick={() => onDelete(rt)}>
          <span className="material-symbols-outlined">delete</span>
          Xóa
        </button>
      </div>
    </div>
  );
}

/* ─── RoomTypeModal (Tạo + Sửa dùng chung) ──── */
const BLANK_FORM = { name: '', pricePerNight: '', maxGuests: 2, description: '', imageUrl: '' };

function RoomTypeModal({ editTarget, onClose, onSaved, hotelId }) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState(
    isEdit
      ? {
          name:         editTarget.name        || '',
          pricePerNight:editTarget.pricePerNight|| '',
          maxGuests:    editTarget.maxGuests    || 2,
          description:  editTarget.description  || '',
          images:       editTarget.images ? [...editTarget.images] : [],
        }
      : { ...BLANK_FORM, images: [] }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      name:          form.name.trim(),
      pricePerNight: Number(form.pricePerNight),
      maxGuests:     Number(form.maxGuests),
      description:   form.description.trim(),
      images:        form.images,
    };
    try {
      if (isEdit) {
        await ownerApi.updateRoomType(editTarget._id, payload);
      } else {
        await ownerApi.createRoomType(hotelId, payload);
      }
      onSaved(isEdit ? 'Cập nhật loại phòng thành công!' : 'Thêm loại phòng thành công!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal ohp-modal" style={{ maxWidth: 560 }}>
        <button className="admin-modal-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            {isEdit ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}
          </h3>
          <p className="admin-modal-sub">
            {isEdit ? 'Cập nhật thông tin hạng phòng' : 'Tạo một hạng phòng mới cho khách sạn'}
          </p>
        </div>

        {error && (
          <div style={{
            background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8,
            padding:'0.6rem 1rem', color:'#b91c1c', fontSize:'0.85rem',
            margin:'0 1.5rem 0.5rem', display:'flex', gap:'0.4rem', alignItems:'center',
          }}>
            <span className="material-symbols-outlined" style={{fontSize:'1rem'}}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '0 1.5rem 1.5rem' }}>

          {/* Tên */}
          <div className="admin-form-group">
            <label className="admin-form-label">Tên hạng phòng *</label>
            <input type="text" className="admin-form-input" required
              value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="VD: Deluxe Double, Suite cao cấp..." />
          </div>

          {/* Giá + Số khách */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Giá / đêm (VNĐ) *</label>
              <input type="number" className="admin-form-input" required min="1000"
                value={form.pricePerNight} onChange={e => set('pricePerNight', e.target.value)}
                placeholder="VD: 800000" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Số khách tối đa *</label>
              <input type="number" className="admin-form-input" required min="1" max="20"
                value={form.maxGuests} onChange={e => set('maxGuests', e.target.value)} />
            </div>
          </div>

          {/* Ảnh Room Type */}
          <div className="admin-form-group">
            <label className="admin-form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Hình ảnh hạng phòng</span>
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
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Chưa có hình ảnh nào.</p>
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div className="admin-form-group">
            <label className="admin-form-label">Mô tả</label>
            <textarea className="admin-form-textarea" rows={3}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Giới thiệu về hạng phòng này..." />
          </div>

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-cancel" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="admin-btn-submit" disabled={saving}>
              {saving
                ? <><span className="ort-btn-spin" />{isEdit ? 'Đang lưu...' : 'Đang tạo...'}</>
                : isEdit ? 'Lưu thay đổi' : 'Thêm loại phòng'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══ MAIN PAGE ════════════════════════════════ */
export default function OwnerRoomTypesPage() {
  const { hotels, selectedHotelId } = useOwner();

  // Hotel đang xem loại phòng — mặc định là KS đang được chọn trong sidebar
  const [activeHotelId, setActiveHotelId] = useState(selectedHotelId || '');

  // Sync khi context thay đổi (lần đầu load)
  useEffect(() => {
    if (selectedHotelId && !activeHotelId) {
      setActiveHotelId(selectedHotelId);
    }
  }, [selectedHotelId]);

  const activeHotel = hotels.find(h => h._id === activeHotelId) || null;

  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);

  // Modal state
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Confirm delete
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [currentPage, setCurrentPage]     = useState(1);
  const ITEMS_PER_PAGE = 10;

  /* ── Fetch danh sách theo activeHotelId ── */
  const fetchRoomTypes = useCallback(async () => {
    if (!activeHotelId) { setRoomTypes([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await ownerApi.getRoomTypes(activeHotelId);
      setRoomTypes(Array.isArray(res.data) ? res.data.filter(rt => !rt.isDeleted) : []);
    } catch {
      flash('Không thể tải danh sách loại phòng.', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeHotelId]);

  useEffect(() => { fetchRoomTypes(); }, [fetchRoomTypes]);

  /* ── Helpers ── */
  const flash = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit   = (rt) => { setEditTarget(rt); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSaved = (msg) => {
    closeModal();
    flash(msg);
    fetchRoomTypes();
  };

  const openConfirm  = (rt) => setConfirmTarget(rt);
  const closeConfirm = () => setConfirmTarget(null);

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await ownerApi.deleteRoomType(confirmTarget._id);
      closeConfirm();
      flash('Đã xóa loại phòng.');
      fetchRoomTypes();
    } catch {
      flash('Xóa thất bại, thử lại.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Stats ── */
  const prices    = roomTypes.map(rt => rt.pricePerNight);
  const minPrice  = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice  = prices.length > 0 ? Math.max(...prices) : null;

  const totalPages = Math.ceil(roomTypes.length / ITEMS_PER_PAGE);
  const paginatedRoomTypes = roomTypes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <OwnerLayout searchPlaceholder="Tìm loại phòng...">

      {/* ── Page Header ── */}
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h2 className="admin-page-header__title">Loại phòng</h2>
          <p className="admin-page-header__sub">
            Quản lý hạng phòng theo từng khách sạn
          </p>
        </div>
        <button className="ort-add-btn" id="btn-add-room-type"
          onClick={openCreate} disabled={!activeHotelId}
          title={!activeHotelId ? 'Chọn khách sạn trước' : ''}
        >
          <span className="material-symbols-outlined">add</span>
          Thêm loại phòng
        </button>
      </div>

      {/* ── Hotel Selector ── */}
      <div className="ort-hotel-selector">
        <span className="material-symbols-outlined ort-hotel-selector__icon">domain</span>
        <div className="ort-hotel-selector__inner">
          <label className="ort-hotel-selector__label">Khách sạn</label>
          <select
            id="select-hotel-for-room-types"
            className="ort-hotel-selector__select"
            value={activeHotelId}
            onChange={e => setActiveHotelId(e.target.value)}
          >
            {hotels.length === 0 && (
              <option value="">Chưa có khách sạn</option>
            )}
            {hotels.map(h => (
              <option key={h._id} value={h._id}>
                {h.name} — {h.city}{!h.isApproved ? ' ⏳' : ' ✅'}
              </option>
            ))}
          </select>
        </div>
        {activeHotel && (
          <span className={`ort-hotel-selector__badge ${
            activeHotel.isApproved ? 'ort-hotel-selector__badge--ok' : 'ort-hotel-selector__badge--pending'
          }`}>
            <span className="material-symbols-outlined">
              {activeHotel.isApproved ? 'verified' : 'schedule'}
            </span>
            {activeHotel.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
          </span>
        )}
      </div>

      {/* ── Stats Strip ── */}
      <div className="admin-stats-grid ort-stats">
        {[
          {
            icon: 'category',
            cls: 'accent',
            label: 'Tổng loại phòng',
            value: roomTypes.length,
          },
          {
            icon: 'arrow_downward',
            cls: 'green',
            label: 'Giá thấp nhất',
            value: minPrice !== null ? fmtPrice(minPrice) : '—',
          },
          {
            icon: 'arrow_upward',
            cls: 'yellow',
            label: 'Giá cao nhất',
            value: maxPrice !== null ? fmtPrice(maxPrice) : '—',
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

      {/* ── Content ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', animation: 'ort-spin 1s linear infinite', display: 'block' }}>
            progress_activity
          </span>
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Đang tải...</p>
        </div>
      ) : roomTypes.length === 0 ? (
        /* ── Empty State ── */
        <div className="ort-empty">
          <span className="material-symbols-outlined">hotel_class</span>
          <h3>Chưa có loại phòng nào</h3>
          <p>Thêm hạng phòng đầu tiên để khách hàng có thể đặt phòng tại khách sạn của bạn.</p>
          <button className="ort-add-btn" onClick={openCreate} style={{ marginTop: '0.5rem' }}>
            <span className="material-symbols-outlined">add</span>
            Thêm loại phòng ngay
          </button>
        </div>
      ) : (
        <>
        {/* ── Card Grid ── */}
        <div className="ort-grid">
          {paginatedRoomTypes.map(rt => (
            <RoomTypeCard
              key={rt._id}
              rt={rt}
              onEdit={openEdit}
              onDelete={openConfirm}
            />
          ))}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination" style={{ marginTop: '1.25rem' }}>
            <span className="admin-pagination__info">
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, roomTypes.length)} / {roomTypes.length}
            </span>
            <div className="admin-pagination__controls">
              <button className="admin-pagination__btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`admin-pagination__btn${p === currentPage ? ' active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
              ))}
              <button className="admin-pagination__btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
        </>
      )}

      {/* ── Modal Tạo / Sửa ── */}
      {showModal && (
        <RoomTypeModal
          editTarget={editTarget}
          hotelId={activeHotelId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* ── Confirm Xóa ── */}
      {confirmTarget && (
        <ConfirmDialog
          name={confirmTarget.name}
          onConfirm={handleDelete}
          onCancel={closeConfirm}
          loading={deleting}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </OwnerLayout>
  );
}
