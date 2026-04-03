import { useState, useEffect, useCallback } from 'react';
import OwnerLayout from '../components/OwnerLayout';
import { useOwner } from '../context/OwnerContext';
import ownerApi from '../api/ownerApi';
import './OwnerRoomsPage.css';

/* ─── Constants ──────────────────────────── */
const STATUS_LABELS = {
  available:   { label: 'Trống',    icon: 'check_circle',     cls: 'available'   },
  occupied:    { label: 'Đang ở',   icon: 'person',           cls: 'occupied'    },
  maintenance: { label: 'Bảo trì',  icon: 'construction',     cls: 'maintenance' },
};

/* ─── Toast ──────────────────────────────── */
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

/* ─── ConfirmDialog ──────────────────────── */
function ConfirmDialog({ roomNumber, onConfirm, onCancel, loading }) {
  return (
    <div className="orm-confirm-overlay">
      <div className="orm-confirm-box">
        <div className="orm-confirm-icon">
          <span className="material-symbols-outlined">delete_forever</span>
        </div>
        <h4>Xóa phòng?</h4>
        <p>
          Bạn sắp xóa phòng <b>"{roomNumber}"</b>.<br />
          Hành động này không thể hoàn tác.
        </p>
        <div className="orm-confirm-actions">
          <button className="orm-confirm-btn orm-confirm-btn--cancel" onClick={onCancel} disabled={loading}>
            Hủy
          </button>
          <button className="orm-confirm-btn orm-confirm-btn--delete" onClick={onConfirm} disabled={loading}>
            {loading ? 'Đang xóa...' : 'Xóa phòng'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── RoomModal (Tạo + Sửa) ──────────────── */
const BLANK = { roomNumber: '', floor: 1, roomType: '', status: 'available' };

function RoomModal({ editTarget, roomTypes, hotelId, onClose, onSaved }) {
  const isEdit = !!editTarget;
  const [form, setForm] = useState(
    isEdit
      ? {
          roomNumber: editTarget.roomNumber || '',
          floor:      editTarget.floor      || 1,
          roomType:   editTarget.roomType?._id || editTarget.roomType || '',
          status:     editTarget.status     || 'available',
        }
      : { ...BLANK, roomType: roomTypes[0]?._id || '' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.roomType) { setError('Vui lòng chọn Loại phòng.'); return; }
    setSaving(true);
    const payload = {
      roomNumber: form.roomNumber.trim(),
      floor:      Number(form.floor),
      roomType:   form.roomType,
      hotel:      hotelId,
    };
    try {
      if (isEdit) {
        await ownerApi.updateRoom(editTarget._id, { ...payload, status: form.status });
      } else {
        await ownerApi.createRoom(hotelId, payload);
      }
      onSaved(isEdit ? 'Cập nhật phòng thành công!' : 'Thêm phòng thành công!');
    } catch (err) {
      setError(err?.response?.data?.message || (isEdit ? 'Cập nhật thất bại.' : 'Tạo thất bại, thử lại.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-modal ohp-modal" style={{ maxWidth: 520 }}>
        <button className="admin-modal-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            {isEdit ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}
          </h3>
          <p className="admin-modal-sub">
            {isEdit ? 'Cập nhật thông tin phòng vật lý' : 'Gán mã phòng vào một Loại phòng'}
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

          {/* Mã phòng + Tầng */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Mã / Số phòng *</label>
              <input type="text" className="admin-form-input" required
                value={form.roomNumber}
                onChange={e => set('roomNumber', e.target.value)}
                placeholder="VD: P101, VIP-02, A305" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Tầng *</label>
              <input type="number" className="admin-form-input" required min="0" max="200"
                value={form.floor}
                onChange={e => set('floor', e.target.value)} />
            </div>
          </div>

          {/* Loại phòng */}
          <div className="admin-form-group">
            <label className="admin-form-label">Loại phòng *</label>
            {roomTypes.length === 0 ? (
              <div style={{
                padding: '0.6rem 0.875rem', borderRadius: 8, background: '#fefce8',
                border: '1px solid #fde68a', color: '#a16207', fontSize: '0.85rem',
              }}>
                ⚠️ Khách sạn này chưa có loại phòng. Vui lòng tạo Loại phòng trước.
              </div>
            ) : (
              <select className="admin-form-select" required
                value={form.roomType}
                onChange={e => set('roomType', e.target.value)}>
                <option value="">-- Chọn loại phòng --</option>
                {roomTypes.map(rt => (
                  <option key={rt._id} value={rt._id}>
                    {rt.name} — {Number(rt.pricePerNight).toLocaleString('vi-VN')} ₫/đêm
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Trạng thái (chỉ khi sửa) */}
          {isEdit && (
            <div className="admin-form-group">
              <label className="admin-form-label">Trạng thái</label>
              <select className="admin-form-select"
                value={form.status}
                onChange={e => set('status', e.target.value)}>
                <option value="available">✅ Trống (Available)</option>
                <option value="occupied">🔵 Đang ở (Occupied)</option>
                <option value="maintenance">🔧 Bảo trì (Maintenance)</option>
              </select>
            </div>
          )}

          <div className="admin-modal-actions">
            <button type="button" className="admin-btn-cancel" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="admin-btn-submit"
              disabled={saving || roomTypes.length === 0}>
              {saving
                ? <><span className="orm-btn-spin" />{isEdit ? 'Đang lưu...' : 'Đang tạo...'}</>
                : isEdit ? 'Lưu thay đổi' : 'Thêm phòng'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══ MAIN PAGE ════════════════════════════════ */
export default function OwnerRoomsPage() {
  const { hotels, selectedHotelId } = useOwner();

  // Hotel đang xem — mặc định theo sidebar
  const [activeHotelId, setActiveHotelId] = useState(selectedHotelId || '');
  useEffect(() => {
    if (selectedHotelId && !activeHotelId) setActiveHotelId(selectedHotelId);
  }, [selectedHotelId]);

  const activeHotel = hotels.find(h => h._id === activeHotelId) || null;

  // Data
  const [rooms, setRooms]         = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading]     = useState(false);

  // Filters
  const [filterType, setFilterType]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const ITEMS_PER_PAGE = 10;

  // UI state
  const [toast, setToast]                         = useState(null);
  const [showModal, setShowModal]                 = useState(false);
  const [editTarget, setEditTarget]               = useState(null);
  const [confirmTarget, setConfirmTarget]         = useState(null);
  const [deleting, setDeleting]                   = useState(false);
  const [togglingId, setTogglingId]               = useState(null);

  /* ── Load rooms + roomTypes khi đổi KS ── */
  const loadData = useCallback(async () => {
    if (!activeHotelId) { setRooms([]); setRoomTypes([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [roomsRes, typesRes] = await Promise.all([
        ownerApi.getRooms(activeHotelId),
        ownerApi.getRoomTypes(activeHotelId),
      ]);
      setRooms(
        (Array.isArray(roomsRes.data) ? roomsRes.data : []).filter(r => !r.isDeleted)
      );
      setRoomTypes(
        (Array.isArray(typesRes.data) ? typesRes.data : []).filter(rt => !rt.isDeleted)
      );
    } catch {
      flash('Không thể tải dữ liệu phòng.', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeHotelId]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Helpers ── */
  const flash = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit   = (r) => { setEditTarget(r);   setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const handleSaved = (msg) => {
    closeModal();
    flash(msg);
    loadData();
  };

  /* ── Toggle trạng thái nhanh ── */
  const handleToggle = async (room) => {
    const next = room.status === 'maintenance' ? 'available' : 'maintenance';
    setTogglingId(room._id);
    try {
      await ownerApi.changeRoomStatus(room._id, next);
      flash(`Phòng ${room.roomNumber} → ${STATUS_LABELS[next].label}`);
      loadData();
    } catch {
      flash('Đổi trạng thái thất bại.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Xóa ── */
  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      await ownerApi.deleteRoom(confirmTarget._id);
      setConfirmTarget(null);
      flash(`Đã xóa phòng ${confirmTarget.roomNumber}.`);
      loadData();
    } catch {
      flash('Xóa thất bại, thử lại.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Filtered rooms ── */
  const filteredRooms = rooms
    .filter(r => !filterType   || (r.roomType?._id === filterType || r.roomType === filterType))
    .filter(r => !filterStatus || r.status === filterStatus);

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ── Stats ── */
  const countByStatus = (s) => rooms.filter(r => r.status === s).length;

  return (
    <OwnerLayout searchPlaceholder="Tìm phòng...">

      {/* ── Page Header ── */}
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h2 className="admin-page-header__title">Quản lý phòng</h2>
          <p className="admin-page-header__sub">Quản lý phòng vật lý theo từng khách sạn</p>
        </div>
        <button className="orm-add-btn" id="btn-add-room"
          onClick={openCreate}
          disabled={!activeHotelId}
          title={!activeHotelId ? 'Chọn khách sạn trước' : ''}>
          <span className="material-symbols-outlined">add</span>
          Thêm phòng
        </button>
      </div>

      {/* ── Hotel Selector ── */}
      <div className="orm-hotel-selector">
        <span className="material-symbols-outlined orm-hotel-selector__icon">domain</span>
        <div className="orm-hotel-selector__inner">
          <label className="orm-hotel-selector__label">Khách sạn</label>
          <select
            id="select-hotel-for-rooms"
            className="orm-hotel-selector__select"
            value={activeHotelId}
            onChange={e => { setActiveHotelId(e.target.value); setFilterType(''); setFilterStatus(''); setCurrentPage(1); }}>
            {hotels.length === 0 && <option value="">Chưa có khách sạn</option>}
            {hotels.map(h => (
              <option key={h._id} value={h._id}>
                {h.name} — {h.city}{!h.isApproved ? ' ⏳' : ' ✅'}
              </option>
            ))}
          </select>
        </div>
        {activeHotel && (
          <span className={`orm-hotel-selector__badge ${
            activeHotel.isApproved ? 'orm-hotel-selector__badge--ok' : 'orm-hotel-selector__badge--pending'
          }`}>
            <span className="material-symbols-outlined">
              {activeHotel.isApproved ? 'verified' : 'schedule'}
            </span>
            {activeHotel.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
          </span>
        )}
      </div>

      {/* nếu chưa chọn KS */}
      {!activeHotelId ? (
        <div className="orm-no-hotel">
          <span className="material-symbols-outlined">apartment</span>
          <p>Vui lòng chọn khách sạn để xem danh sách phòng.</p>
        </div>
      ) : (
        <>
          {/* ── Stats Strip ── */}
          <div className="admin-stats-grid orm-stats">
            {[
              { icon: 'meeting_room', cls: 'accent', label: 'Tổng phòng',  value: rooms.length },
              { icon: 'check_circle', cls: 'green',  label: 'Trống',        value: countByStatus('available') },
              { icon: 'person',       cls: 'blue',   label: 'Đang ở',       value: countByStatus('occupied') },
              { icon: 'construction', cls: 'yellow', label: 'Bảo trì',      value: countByStatus('maintenance') },
            ].map(s => (
              <div key={s.label} className="admin-stat-card">
                <div className="admin-stat-card__top">
                  <p className="admin-stat-card__label">{s.label}</p>
                  <div className={`admin-stat-card__icon admin-stat-card__icon--${s.cls}`}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                </div>
                <p className="admin-stat-card__value">{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Filter Bar ── */}
          <div className="orm-filter-bar">
            <span className="orm-filter-bar__label">Loại phòng:</span>
            <select className="orm-filter-select"
              value={filterType}
              onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}>
              <option value="">Tất cả ({rooms.length})</option>
              {roomTypes.map(rt => (
                <option key={rt._id} value={rt._id}>
                  {rt.name} ({rooms.filter(r => (r.roomType?._id || r.roomType) === rt._id).length})
                </option>
              ))}
            </select>

            <div className="orm-filter-bar__sep" />

            <span className="orm-filter-bar__label">Trạng thái:</span>
            <select className="orm-filter-select"
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
              <option value="">Tất cả</option>
              <option value="available">Trống</option>
              <option value="occupied">Đang ở</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          {/* ── Table hoặc Empty ── */}
          {loading ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'#94a3b8' }}>
              <span className="material-symbols-outlined"
                style={{ fontSize:'2rem', display:'block', animation:'orm-spin 1s linear infinite' }}>
                progress_activity
              </span>
              <p style={{ marginTop:'0.75rem', fontSize:'0.875rem' }}>Đang tải...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="orm-empty">
              <span className="material-symbols-outlined">meeting_room</span>
              <h3>{rooms.length === 0 ? 'Chưa có phòng nào' : 'Không tìm thấy phòng phù hợp'}</h3>
              <p>
                {rooms.length === 0
                  ? 'Thêm phòng đầu tiên để bắt đầu nhận đặt phòng.'
                  : 'Thử thay đổi bộ lọc để xem thêm kết quả.'}
              </p>
              {rooms.length === 0 && (
                <button className="orm-add-btn" onClick={openCreate} style={{ marginTop:'0.5rem' }}>
                  <span className="material-symbols-outlined">add</span>
                  Thêm phòng ngay
                </button>
              )}
            </div>
          ) : (
            <div className="admin-table-card">
              <div className="admin-table-card__header">
                <h3 className="font-bold">
                  Danh sách phòng
                  <span style={{ fontWeight:400, color:'#94a3b8', marginLeft:'0.4rem' }}>
                    ({filteredRooms.length}{rooms.length !== filteredRooms.length ? `/${rooms.length}` : ''})
                  </span>
                </h3>
              </div>
              <div className="orm-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã phòng</th>
                      <th>Tầng</th>
                      <th>Loại phòng</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign:'center' }}>Đổi TT</th>
                      <th style={{ textAlign:'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRooms.map(r => {
                      const st          = STATUS_LABELS[r.status] || STATUS_LABELS.available;
                      const isOccupied  = r.status === 'occupied';
                      const isMaint     = r.status === 'maintenance';
                      const typeName    = r.roomType?.name || '—';
                      const isToggling  = togglingId === r._id;

                      return (
                        <tr key={r._id}>
                          {/* Mã phòng */}
                          <td>
                            <strong style={{ fontSize:'0.9rem' }}>{r.roomNumber}</strong>
                          </td>

                          {/* Tầng */}
                          <td>
                            <span className="orm-floor-badge">{r.floor}</span>
                          </td>

                          {/* Loại phòng */}
                          <td style={{ color:'#475569' }}>{typeName}</td>

                          {/* Trạng thái */}
                          <td>
                            <span className={`orm-badge orm-badge--${st.cls}`}>
                              <span className="material-symbols-outlined">{st.icon}</span>
                              {st.label}
                            </span>
                          </td>

                          {/* Toggle nhanh */}
                          <td style={{ textAlign:'center' }}>
                            {isOccupied ? (
                              <span style={{ fontSize:'0.72rem', color:'#94a3b8' }}>—</span>
                            ) : (
                              <button
                                className={`orm-toggle-btn ${
                                  isMaint
                                    ? 'orm-toggle-btn--to-available'
                                    : 'orm-toggle-btn--to-maintenance'
                                }`}
                                onClick={() => handleToggle(r)}
                                disabled={isToggling}
                                title={isMaint ? 'Đặt lại Trống' : 'Chuyển Bảo trì'}
                              >
                                <span className="material-symbols-outlined">swap_horiz</span>
                                {isToggling ? '...' : isMaint ? 'Trống' : 'Bảo trì'}
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="orm-action-group" style={{ justifyContent:'flex-end' }}>
                              <button className="orm-action-btn orm-action-btn--edit"
                                onClick={() => openEdit(r)}
                                title="Chỉnh sửa">
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              <button className="orm-action-btn orm-action-btn--delete"
                                onClick={() => setConfirmTarget(r)}
                                disabled={isOccupied}
                                title={isOccupied ? 'Không thể xóa phòng đang có khách' : 'Xóa phòng'}>
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
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <span className="admin-pagination__info">
                    Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredRooms.length)} / {filteredRooms.length}
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
            </div>
          )}
        </>
      )}

      {/* ── Modal Tạo / Sửa ── */}
      {showModal && (
        <RoomModal
          editTarget={editTarget}
          roomTypes={roomTypes}
          hotelId={activeHotelId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* ── Confirm xóa ── */}
      {confirmTarget && (
        <ConfirmDialog
          roomNumber={confirmTarget.roomNumber}
          onConfirm={handleDelete}
          onCancel={() => setConfirmTarget(null)}
          loading={deleting}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </OwnerLayout>
  );
}
