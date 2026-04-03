import { useState, useEffect, useCallback } from 'react';
import OwnerLayout from '../components/OwnerLayout';
import { useOwner } from '../context/OwnerContext';
import ownerApi from '../api/ownerApi';
import './OwnerBookingsPage.css';

/* ─── Constants ─────────────────────────── */
const STATUS_META = {
  pending:     { label: 'Chờ duyệt',    icon: 'schedule',     cls: 'pending'    },
  confirmed:   { label: 'Đã xác nhận',  icon: 'check_circle', cls: 'confirmed'  },
  checked_in:  { label: 'Đang ở',       icon: 'hotel',        cls: 'checked_in' },
  checked_out: { label: 'Đã trả phòng', icon: 'logout',       cls: 'checked_out'},
  cancelled:   { label: 'Đã hủy',       icon: 'cancel',       cls: 'cancelled'  },
};

const ACTION_META = {
  confirm:   { label: 'Xác nhận',   icon: 'check_circle', cls: 'confirm'  },
  'check-in': { label: 'Check-in',   icon: 'login',        cls: 'checkin'  },
  'check-out':{ label: 'Check-out',  icon: 'logout',       cls: 'checkout' },
  cancel:    { label: 'Hủy ĐP',     icon: 'cancel',       cls: 'cancel'   },
};

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtPrice = (n) => Number(n || 0).toLocaleString('vi-VN') + ' ₫';
const nights   = (ci, co) => {
  if (!ci || !co) return 0;
  return Math.max(1, Math.ceil((new Date(co) - new Date(ci)) / 86400000));
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

/* ─── Status Badge ───────────────────────── */
function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`obk-badge obk-badge--${m.cls}`}>
      <span className="material-symbols-outlined">{m.icon}</span>
      {m.label}
    </span>
  );
}

/* ─── Detail Drawer ──────────────────────── */
function DetailDrawer({ booking, onClose, onAction, actionLoading }) {
  if (!booking) return null;
  const n = nights(booking.checkInDate, booking.checkOutDate);
  const hasDiscount = booking.discountAmount > 0;

  const actions = getActions(booking.status);

  return (
    <>
      <div className="obk-drawer-overlay" onClick={onClose} />
      <div className="obk-drawer">
        {/* Header */}
        <div className="obk-drawer__header">
          <span className="obk-drawer__title">Chi tiết đặt phòng</span>
          <button className="obk-drawer__close" onClick={onClose}>
            <span className="material-symbols-outlined" style={{fontSize:'1.1rem'}}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="obk-drawer__body">
          {/* Mã + Trạng thái */}
          <div className="obk-drawer__section">
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Mã đặt phòng</span>
              <span className="obk-code">#{booking.bookingCode || booking._id?.slice(-6).toUpperCase()}</span>
            </div>
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Trạng thái</span>
              <StatusBadge status={booking.status} />
            </div>
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Ngày đặt</span>
              <span className="obk-drawer__row-value">{fmtDate(booking.createdAt)}</span>
            </div>
          </div>

          {/* Thông tin khách */}
          <div className="obk-drawer__section">
            <p className="obk-drawer__section-title">
              <span className="material-symbols-outlined" style={{fontSize:'0.8rem',verticalAlign:'middle',marginRight:4}}>person</span>
              Khách hàng
            </p>
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Tên</span>
              <span className="obk-drawer__row-value">{booking.user?.fullName || booking.user?.username || '—'}</span>
            </div>
            {booking.user?.email && (
              <div className="obk-drawer__row">
                <span className="obk-drawer__row-label">Email</span>
                <span className="obk-drawer__row-value">{booking.user.email}</span>
              </div>
            )}
            {booking.user?.phone && (
              <div className="obk-drawer__row">
                <span className="obk-drawer__row-label">Phone</span>
                <span className="obk-drawer__row-value">{booking.user.phone}</span>
              </div>
            )}
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Số khách</span>
              <span className="obk-drawer__row-value">{booking.numberOfGuests} người</span>
            </div>
          </div>

          {/* Phòng */}
          <div className="obk-drawer__section">
            <p className="obk-drawer__section-title">
              <span className="material-symbols-outlined" style={{fontSize:'0.8rem',verticalAlign:'middle',marginRight:4}}>meeting_room</span>
              Phòng
            </p>
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Mã phòng</span>
              <span className="obk-drawer__row-value">
                {booking.rooms && booking.rooms.length > 0
                  ? booking.rooms.map(r => r.roomNumber).join(', ')
                  : '—'}
              </span>
            </div>
            {booking.rooms && booking.rooms.length > 0 && booking.rooms[0]?.roomType && (
              <div className="obk-drawer__row">
                <span className="obk-drawer__row-label">Loại phòng</span>
                <span className="obk-drawer__row-value">
                  {booking.rooms.map(r => r.roomType?.name || r.roomType).filter(Boolean).join(', ') || '—'}
                </span>
              </div>
            )}
            {booking.rooms && booking.rooms.length > 0 && booking.rooms[0]?.floor !== undefined && (
              <div className="obk-drawer__row">
                <span className="obk-drawer__row-label">Tầng</span>
                <span className="obk-drawer__row-value">
                  {[...new Set(booking.rooms.map(r => r.floor))].map(f => `Tầng ${f}`).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Ngày */}
          <div className="obk-drawer__section">
            <p className="obk-drawer__section-title">
              <span className="material-symbols-outlined" style={{fontSize:'0.8rem',verticalAlign:'middle',marginRight:4}}>calendar_month</span>
              Lịch trình
            </p>
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Check-in</span>
              <span className="obk-drawer__row-value">{fmtDate(booking.checkInDate)}</span>
            </div>
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Check-out</span>
              <span className="obk-drawer__row-value">{fmtDate(booking.checkOutDate)}</span>
            </div>
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Số đêm</span>
              <span className="obk-drawer__row-value">{n} đêm</span>
            </div>
          </div>

          {/* Thanh toán */}
          <div className="obk-drawer__section">
            <p className="obk-drawer__section-title">
              <span className="material-symbols-outlined" style={{fontSize:'0.8rem',verticalAlign:'middle',marginRight:4}}>payments</span>
              Thanh toán
            </p>
            {hasDiscount && (
              <div className="obk-drawer__row">
                <span className="obk-drawer__row-label">Giảm giá</span>
                <span className="obk-drawer__row-value" style={{color:'#15803d'}}>
                  -{fmtPrice(booking.discountAmount)}
                </span>
              </div>
            )}
            <div className="obk-drawer__row">
              <span className="obk-drawer__row-label">Tổng tiền</span>
              <span className="obk-drawer__row-value" style={{color:'#0891b2', fontSize:'0.9rem'}}>
                {fmtPrice(booking.totalPrice)}
              </span>
            </div>
          </div>

          {/* Ghi chú */}
          {booking.specialRequests && (
            <div className="obk-drawer__section">
              <p className="obk-drawer__section-title">Ghi chú đặc biệt</p>
              <div className="obk-drawer__specials">{booking.specialRequests}</div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        {actions.length > 0 && (
          <div className="obk-drawer__actions">
            {actions.map(act => {
              const m = ACTION_META[act];
              const isLoading = actionLoading === booking._id;
              return (
                <button
                  key={act}
                  className={`obk-drawer__action-btn obk-drawer__action-btn--${m.cls}`}
                  onClick={() => onAction(booking._id, act)}
                  disabled={isLoading}
                >
                  {isLoading
                    ? <><span className="obk-btn-spin" />Đang xử lý...</>
                    : <><span className="material-symbols-outlined">{m.icon}</span>{m.label}</>
                  }
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Helpers ────────────────────────────── */
function getActions(status) {
  if (status === 'pending')    return ['confirm', 'cancel'];
  if (status === 'confirmed')  return ['check-in', 'cancel'];
  if (status === 'checked_in') return ['check-out'];
  return [];
}

/* ══ MAIN PAGE ════════════════════════════════ */
export default function OwnerBookingsPage() {
  const { hotels, selectedHotelId } = useOwner();
  const [activeHotelId, setActiveHotelId] = useState(selectedHotelId || '');
  useEffect(() => {
    if (selectedHotelId && !activeHotelId) setActiveHotelId(selectedHotelId);
  }, [selectedHotelId]);

  const activeHotel = hotels.find(h => h._id === activeHotelId) || null;

  // Data
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(false);

  // Filters
  const [statusTab, setStatusTab] = useState('');
  const [search, setSearch]       = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // UI
  const [toast, setToast]               = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  /* ── Load bookings ── */
  const loadBookings = useCallback(async () => {
    if (!activeHotelId) { setBookings([]); return; }
    setLoading(true);
    try {
      const res = await ownerApi.getBookings(activeHotelId);
      setBookings(
        (Array.isArray(res.data) ? res.data : []).filter(b => !b.isDeleted)
      );
    } catch {
      flash('Không thể tải danh sách đặt phòng.', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeHotelId]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  /* ── Helpers ── */
  const flash = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Action handler ── */
  const handleAction = async (bookingId, action) => {
    setActionLoading(bookingId);
    try {
      if (action === 'confirm')    await ownerApi.confirmBooking(bookingId);
      if (action === 'check-in')   await ownerApi.checkIn(bookingId);
      if (action === 'check-out')  await ownerApi.checkOut(bookingId);
      if (action === 'cancel')     await ownerApi.cancelBooking(bookingId);

      const labelMap = {
        'confirm':   'Xác nhận đặt phòng thành công!',
        'check-in':  'Check-in thành công!',
        'check-out': 'Check-out thành công!',
        'cancel':    'Đã hủy đặt phòng.',
      };
      flash(labelMap[action] || 'Thao tác thành công!');
      await loadBookings();

      // Cập nhật detail panel nếu đang xem booking đó
      if (detailBooking?._id === bookingId) {
        const updated = await ownerApi.getBooking(bookingId);
        setDetailBooking(updated.data);
      }
    } catch (err) {
      flash('Thao tác thất bại: ' + (err?.response?.data?.message || 'Thử lại.'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Filtered ── */
  const filtered = bookings
    .filter(b => !statusTab || b.status === statusTab)
    .filter(b => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (b.bookingCode || '').toLowerCase().includes(s) ||
        (b.user?.fullName || '').toLowerCase().includes(s) ||
        (b.user?.username || '').toLowerCase().includes(s) ||
        (b.user?.email || '').toLowerCase().includes(s) ||
        (b.rooms || []).some(r => (r.roomNumber || '').toLowerCase().includes(s))
      );
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedBookings = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ── Stats ── */
  const countStatus = (s) => bookings.filter(b => b.status === s).length;
  const pendingCount = countStatus('pending');
  const revenueThisMonth = bookings
    .filter(b => b.status === 'checked_out')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const TABS = [
    { key: '',           label: 'Tất cả' },
    { key: 'pending',    label: 'Chờ duyệt' },
    { key: 'confirmed',  label: 'Đã xác nhận' },
    { key: 'checked_in', label: 'Đang ở' },
    { key: 'checked_out',label: 'Đã trả phòng' },
    { key: 'cancelled',  label: 'Đã hủy' },
  ];

  return (
    <OwnerLayout searchPlaceholder="Tìm đặt phòng...">

      {/* ── Page Header ── */}
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h2 className="admin-page-header__title">Đặt phòng</h2>
          <p className="admin-page-header__sub">Quản lý và xử lý đơn đặt phòng</p>
        </div>
        {pendingCount > 0 && (
          <div style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            background:'#fef2f2', border:'1px solid #fecdd3', borderRadius:10,
            padding:'0.5rem 1rem', color:'#be123c', fontSize:'0.85rem', fontWeight:700,
          }}>
            <span className="material-symbols-outlined" style={{fontSize:'1.1rem'}}>notifications_active</span>
            {pendingCount} đơn chờ duyệt!
          </div>
        )}
      </div>

      {/* ── Hotel Selector ── */}
      <div className="obk-hotel-selector">
        <span className="material-symbols-outlined obk-hotel-selector__icon">domain</span>
        <div className="obk-hotel-selector__inner">
          <label className="obk-hotel-selector__label">Khách sạn</label>
          <select
            id="select-hotel-for-bookings"
            className="obk-hotel-selector__select"
            value={activeHotelId}
            onChange={e => { setActiveHotelId(e.target.value); setStatusTab(''); setSearch(''); setCurrentPage(1); }}
          >
            {hotels.length === 0 && <option value="">Chưa có khách sạn</option>}
            {hotels.map(h => (
              <option key={h._id} value={h._id}>
                {h.name} — {h.city}{!h.isApproved ? ' ⏳' : ' ✅'}
              </option>
            ))}
          </select>
        </div>
        {activeHotel && (
          <span className={`obk-hotel-selector__badge ${
            activeHotel.isApproved ? 'obk-hotel-selector__badge--ok' : 'obk-hotel-selector__badge--pending'
          }`}>
            <span className="material-symbols-outlined">
              {activeHotel.isApproved ? 'verified' : 'schedule'}
            </span>
            {activeHotel.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
          </span>
        )}
      </div>

      {/* Nếu chưa chọn KS */}
      {!activeHotelId ? (
        <div className="obk-no-hotel">
          <span className="material-symbols-outlined">apartment</span>
          <p>Vui lòng chọn khách sạn để xem đơn đặt phòng.</p>
        </div>
      ) : (
        <>
          {/* ── Stats Strip ── */}
          <div className="admin-stats-grid" style={{ marginBottom: '1.25rem' }}>
            {[
              { icon:'book_online',  cls:'accent',  label:'Tổng đặt phòng', value: bookings.length },
              { icon:'pending',      cls:'yellow',  label:'Chờ duyệt',       value: pendingCount,
                urgent: pendingCount > 0 },
              { icon:'hotel',        cls:'blue',    label:'Đang ở',          value: countStatus('checked_in') },
              { icon:'payments',     cls:'green',   label:'Doanh thu (đã TT)',
                value: revenueThisMonth > 0 ? fmtPrice(revenueThisMonth) : '—' },
            ].map(s => (
              <div key={s.label} className="admin-stat-card"
                style={s.urgent ? {borderColor:'#fca5a5', background:'#fff1f2'} : {}}>
                <div className="admin-stat-card__top">
                  <p className="admin-stat-card__label">{s.label}</p>
                  <div className={`admin-stat-card__icon admin-stat-card__icon--${s.cls}`}>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                </div>
                <p className="admin-stat-card__value" style={{fontSize:'1rem'}}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Status Tabs ── */}
          <div className="obk-tabs">
            {TABS.map(t => {
              const cnt = t.key ? countStatus(t.key) : bookings.length;
              const isPending = t.key === 'pending' && cnt > 0;
              return (
                <button key={t.key}
                  className={`obk-tab${statusTab === t.key ? ' active' : ''}`}
                  onClick={() => { setStatusTab(t.key); setCurrentPage(1); }}
                >
                  {t.label}
                  <span className={`obk-tab__count${isPending ? ' obk-tab__count--alert' : ''}`}>
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Search ── */}
          <div className="obk-search-wrap">
            <span className="material-symbols-outlined obk-search-icon">search</span>
            <input type="text" className="obk-search-input"
              placeholder="Tìm theo mã đặt phòng, tên khách, email, số phòng..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* ── Table ── */}
          {loading ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'#94a3b8' }}>
              <span className="material-symbols-outlined"
                style={{ fontSize:'2rem', display:'block', animation:'obk-spin 1s linear infinite' }}>
                progress_activity
              </span>
              <p style={{ marginTop:'0.75rem', fontSize:'0.875rem' }}>Đang tải...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="obk-empty">
              <span className="material-symbols-outlined">book_online</span>
              <h3>{bookings.length === 0 ? 'Chưa có đặt phòng nào' : 'Không tìm thấy kết quả'}</h3>
              <p>
                {bookings.length === 0
                  ? 'Các đơn đặt phòng sẽ xuất hiện ở đây sau khi khách hàng đặt phòng.'
                  : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'}
              </p>
            </div>
          ) : (
            <div className="admin-table-card">
              <div className="admin-table-card__header">
                <h3 className="font-bold">
                  Danh sách đặt phòng
                  <span style={{ fontWeight:400, color:'#94a3b8', marginLeft:'0.4rem', fontSize:'0.85rem' }}>
                    ({filtered.length}{bookings.length !== filtered.length ? `/${bookings.length}` : ''})
                  </span>
                </h3>
              </div>
              <div className="obk-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã ĐP</th>
                      <th>Khách hàng</th>
                      <th>Phòng</th>
                      <th>Check-in / Check-out</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign:'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map(b => {
                      const n = nights(b.checkInDate, b.checkOutDate);
                      const actions = getActions(b.status);
                      const isActing = actionLoading === b._id;

                      return (
                        <tr key={b._id}>
                          {/* Mã */}
                          <td>
                            <span className="obk-code">
                              #{b.bookingCode || b._id?.slice(-6).toUpperCase()}
                            </span>
                          </td>

                          {/* Khách */}
                          <td>
                            <div className="obk-customer">
                              <div className="obk-customer__avatar">
                                {(b.user?.fullName || b.user?.username || '?').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="obk-customer__name">
                                  {b.user?.fullName || b.user?.username || 'Khách ẩn danh'}
                                </p>
                                <p className="obk-customer__email">{b.user?.email || '—'}</p>
                              </div>
                            </div>
                          </td>

                          {/* Phòng */}
                          <td style={{ color:'#475569', fontSize:'0.875rem' }}>
                            <b>{b.rooms && b.rooms.length > 0 ? b.rooms.map(r => r.roomNumber).join(', ') : '—'}</b>
                            {b.rooms && b.rooms.length > 0 && b.rooms[0]?.roomType?.name && (
                              <div style={{ fontSize:'0.72rem', color:'#94a3b8' }}>
                                {b.rooms.map(r => r.roomType?.name).filter(Boolean).join(', ')}
                              </div>
                            )}
                          </td>

                          {/* Ngày */}
                          <td>
                            <p className="obk-dates-main">
                              {fmtDate(b.checkInDate)} → {fmtDate(b.checkOutDate)}
                            </p>
                            <p className="obk-dates-nights">{n} đêm · {b.numberOfGuests} khách</p>
                          </td>

                          {/* Giá */}
                          <td>
                            <p className="obk-price">{fmtPrice(b.totalPrice)}</p>
                            {b.discountAmount > 0 && (
                              <p className="obk-price--discount">-{fmtPrice(b.discountAmount)}</p>
                            )}
                          </td>

                          {/* Status */}
                          <td>
                            <StatusBadge status={b.status} />
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="obk-action-group" style={{ justifyContent:'flex-end' }}>
                              {actions.map(act => {
                                const m = ACTION_META[act];
                                return (
                                  <button key={act}
                                    className={`obk-action-btn obk-action-btn--${m.cls}`}
                                    onClick={() => handleAction(b._id, act)}
                                    disabled={isActing}
                                    title={m.label}
                                  >
                                    {isActing
                                      ? <span className="obk-btn-spin" />
                                      : <span className="material-symbols-outlined">{m.icon}</span>
                                    }
                                    {m.label}
                                  </button>
                                );
                              })}
                              {/* Nút xem chi tiết */}
                              <button className="obk-action-btn obk-action-btn--view"
                                onClick={() => setDetailBooking(b)}
                                title="Xem chi tiết">
                                <span className="material-symbols-outlined">visibility</span>
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
                    Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
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

      {/* ── Detail Drawer ── */}
      {detailBooking && (
        <DetailDrawer
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </OwnerLayout>
  );
}
