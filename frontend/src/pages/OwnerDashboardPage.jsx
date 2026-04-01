import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OwnerLayout from '../components/OwnerLayout';
import { useOwner } from '../context/OwnerContext';
import ownerApi from '../api/ownerApi';
import './OwnerDashboardPage.css';

/* ─── Helpers ──────────────────────────────────────────────── */
const fmtVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const MONTHS_VI = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const STATUS_CFG = {
  pending:     { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fef3c7' },
  confirmed:   { label: 'Đã xác nhận',  color: '#3b82f6', bg: '#eff6ff' },
  checked_in:  { label: 'Đang ở',       color: '#10b981', bg: '#d1fae5' },
  checked_out: { label: 'Đã trả phòng', color: '#6366f1', bg: '#ede9fe' },
  cancelled:   { label: 'Đã hủy',       color: '#ef4444', bg: '#fee2e2' },
};

/* ─── Skeleton ─────────────────────────────────────────────── */
function Sk({ w = '100%', h = 20 }) {
  return <span className="owner-sk" style={{ width: w, height: h }} />;
}

/* ─── Bar Chart (SVG) ──────────────────────────────────────── */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="odc-bar-chart">
      {data.map((d, i) => {
        const pct = Math.max((d.amount / max) * 100, 2);
        return (
          <div key={i} className="odc-bar-col">
            <span className="odc-bar-tip">{fmtVND(d.amount)}</span>
            <div className="odc-bar-wrap">
              <div className="odc-bar" style={{ height: `${pct}%` }} />
            </div>
            <span className="odc-bar-label">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Donut Chart (SVG) ────────────────────────────────────── */
function DonutChart({ segments }) {
  const r = 50, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" className="odc-donut-svg">
      {segments.map((seg, i) => {
        const pct   = seg.value / total;
        const dash  = circ * pct;
        const gap   = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 60 60)"
          />
        );
        offset += dash;
        return el;
      })}
      <text x="60" y="55" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0c1a2e">
        {total}
      </text>
      <text x="60" y="70" textAnchor="middle" fontSize="8" fill="#64748b">booking</text>
    </svg>
  );
}

/* ─── Occupancy Ring ───────────────────────────────────────── */
function OccupancyRing({ rate, occupied, total }) {
  const r = 48, circ = 2 * Math.PI * r;
  const pct = parseFloat(rate) || 0;
  return (
    <svg viewBox="0 0 120 120" className="odc-ring-svg">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
      <circle
        cx="60" cy="60" r={r} fill="none"
        stroke="#0891b2" strokeWidth="14"
        strokeDasharray={`${circ * pct / 100} ${circ}`}
        strokeDashoffset={circ * 0.25}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="54" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0c1a2e">
        {pct}%
      </text>
      <text x="60" y="68" textAnchor="middle" fontSize="8" fill="#64748b">
        {occupied}/{total} phòng
      </text>
    </svg>
  );
}

/* ─── Badge ────────────────────────────────────────────────── */
function SBadge({ status }) {
  const c = STATUS_CFG[status] || { label: status, color: '#64748b', bg: '#f1f5f9' };
  return (
    <span className="owner-badge" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

/* ═══ MAIN PAGE ════════════════════════════════════════════════ */
export default function OwnerDashboardPage() {
  const { hotel, hotelId, loading: hotelLoading } = useOwner();

  const [bookingStats, setBookingStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [occupancy, setOccupancy]       = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [chartData, setChartData]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast]               = useState(null);
  const [period, setPeriod]             = useState('month'); // month | year

  /* ── Fetch all ── */
  const fetchAll = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const [statsRes, revRes, occRes, bookRes] = await Promise.all([
        ownerApi.getBookingStats(hotelId),
        ownerApi.getRevenue(hotelId),
        ownerApi.getOccupancy(hotelId),
        ownerApi.getBookings(hotelId),
      ]);
      if (statsRes?.data) setBookingStats(statsRes.data);
      if (revRes?.data)   setRevenueStats(revRes.data);
      if (occRes?.data)   setOccupancy(occRes.data);
      if (bookRes?.data) {
        const sorted = [...bookRes.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentBookings(sorted.slice(0, 8));
        buildChart(bookRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ── Build 6-month bar chart from bookings ── */
  const buildChart = (bookings) => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { month: MONTHS_VI[d.getMonth()], m: d.getMonth(), year: d.getFullYear(), amount: 0 };
    });
    bookings
      .filter(b => b.status === 'checked_out')
      .forEach(b => {
        const d = new Date(b.checkOutDate);
        const idx = months.findIndex(m => m.m === d.getMonth() && m.year === d.getFullYear());
        if (idx !== -1) months[idx].amount += b.totalPrice || 0;
      });
    setChartData(months);
  };

  useEffect(() => { if (hotelId) fetchAll(); }, [hotelId]);

  /* ── Actions ── */
  const doAction = async (id, action) => {
    setActionLoading(id);
    try {
      if (action === 'confirm')    await ownerApi.confirmBooking(id);
      if (action === 'check-in')   await ownerApi.checkIn(id);
      if (action === 'check-out')  await ownerApi.checkOut(id);
      if (action === 'cancel')     await ownerApi.cancelBooking(id);
      flash('✓ Cập nhật thành công!');
      fetchAll();
    } catch { flash('Có lỗi xảy ra, thử lại.', 'error'); }
    finally  { setActionLoading(null); }
  };

  const flash = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Loading / no hotel ── */
  if (hotelLoading) return (
    <OwnerLayout>
      <div className="odc-full-center">
        <div className="odc-spinner" />
      </div>
    </OwnerLayout>
  );

  if (!hotel) return (
    <OwnerLayout>
      <div className="odc-no-hotel">
        <span className="material-symbols-outlined">hotel</span>
        <h2>Bạn chưa có khách sạn</h2>
        <p>Tạo khách sạn để bắt đầu nhận đặt phòng.</p>
      </div>
    </OwnerLayout>
  );

  /* ── Derived numbers ── */
  const bs    = bookingStats || {};
  const total = bs.total      || 0;
  const rev   = revenueStats?.total || 0;
  const occ   = occupancy || {};
  const totalRooms    = occ.totalRooms    || 0;
  const occupiedRooms = occ.occupiedRooms || 0;
  const occRate       = occ.occupancyRate || '0%';

  const donutSegments = [
    { label: 'Chờ xác nhận', value: bs.pending    || 0, color: '#f59e0b' },
    { label: 'Đã xác nhận',  value: bs.confirmed  || 0, color: '#3b82f6' },
    { label: 'Đang ở',       value: bs.checkedIn  || 0, color: '#10b981' },
    { label: 'Đã trả phòng', value: bs.checkedOut || 0, color: '#6366f1' },
    { label: 'Đã hủy',       value: bs.cancelled  || 0, color: '#ef4444' },
  ].filter(s => s.value > 0);

  /* ── KPI cards ── */
  const kpiCards = [
    {
      icon: 'payments', cls: 'teal', label: 'Doanh thu',
      value: loading ? null : fmtVND(rev),
      sub: `${revenueStats?.count || 0} lần thanh toán`,
    },
    {
      icon: 'book_online', cls: 'blue', label: 'Tổng đặt phòng',
      value: loading ? null : total,
      sub: `${bs.pending || 0} đang chờ xác nhận`,
    },
    {
      icon: 'meeting_room', cls: 'green', label: 'Phòng trống',
      value: loading ? null : `${totalRooms - occupiedRooms}/${totalRooms}`,
      sub: `Tỷ lệ lấp đầy ${occRate}`,
    },
    {
      icon: 'star', cls: 'amber', label: 'Đánh giá TB',
      value: loading ? null : (hotel?.rating ? Number(hotel.rating).toFixed(1) : '—'),
      sub: `${hotel?.totalReviews || 0} đánh giá`,
    },
  ];

  return (
    <OwnerLayout searchPlaceholder="Tìm đặt phòng, khách...">

      {/* ── Header ── */}
      <div className="odc-top">
        <div>
          <h1 className="odc-title">Báo cáo & Thống kê</h1>
          <p className="odc-sub">
            Tổng quan hoạt động — <strong>{hotel.name}</strong>
            {!hotel.isApproved && (
              <span className="odc-pending-chip">
                <span className="material-symbols-outlined">schedule</span> Chờ duyệt
              </span>
            )}
          </p>
        </div>
        <Link to="/owner/bookings" className="owner-btn-primary">
          <span className="material-symbols-outlined">calendar_month</span>
          Quản lý đặt phòng
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="odc-kpi-grid">
        {kpiCards.map(c => (
          <div key={c.label} className="odc-kpi-card">
            <div className={`odc-kpi-icon odc-kpi-icon--${c.cls}`}>
              <span className="material-symbols-outlined">{c.icon}</span>
            </div>
            <div className="odc-kpi-body">
              <p className="odc-kpi-label">{c.label}</p>
              <p className="odc-kpi-value">
                {c.value === null ? <Sk w="7rem" h={28} /> : c.value}
              </p>
              <p className="odc-kpi-sub">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="odc-charts-row">

        {/* Revenue Bar */}
        <div className="owner-table-card odc-chart-card">
          <div className="owner-table-card__header">
            <div>
              <p className="owner-table-card__title">Doanh thu 6 tháng gần đây</p>
              <p className="odc-chart-sub">Tính từ các booking đã check-out</p>
            </div>
          </div>
          <div className="odc-chart-body">
            {loading
              ? <Sk h={140} />
              : chartData.every(d => d.amount === 0)
                ? (
                  <div className="odc-empty-chart">
                    <span className="material-symbols-outlined">bar_chart</span>
                    <p>Chưa có dữ liệu doanh thu</p>
                  </div>
                )
                : <BarChart data={chartData} />
            }
          </div>
        </div>

        {/* Booking Status Donut */}
        <div className="owner-table-card odc-donut-card">
          <div className="owner-table-card__header">
            <p className="owner-table-card__title">Trạng thái đặt phòng</p>
          </div>
          <div className="odc-donut-body">
            {loading ? (
              <div style={{ padding: '1.5rem' }}><Sk h={120} /></div>
            ) : total === 0 ? (
              <div className="odc-empty-chart">
                <span className="material-symbols-outlined">donut_large</span>
                <p>Chưa có đặt phòng</p>
              </div>
            ) : (
              <>
                <DonutChart segments={donutSegments} />
                <ul className="odc-donut-legend">
                  {donutSegments.map(s => (
                    <li key={s.label}>
                      <span className="odc-legend-dot" style={{ background: s.color }} />
                      <span className="odc-legend-label">{s.label}</span>
                      <span className="odc-legend-val">{s.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Occupancy Ring */}
        <div className="owner-table-card odc-occ-card">
          <div className="owner-table-card__header">
            <p className="owner-table-card__title">Tỷ lệ lấp đầy</p>
          </div>
          <div className="odc-occ-body">
            {loading ? (
              <Sk h={120} />
            ) : (
              <>
                <OccupancyRing rate={parseFloat(occRate)} occupied={occupiedRooms} total={totalRooms} />
                <div className="odc-occ-stats">
                  <div className="odc-occ-row">
                    <span className="odc-occ-dot" style={{ background: '#e2e8f0' }} />
                    <span>Còn trống</span>
                    <strong style={{ color: '#16a34a' }}>{totalRooms - occupiedRooms}</strong>
                  </div>
                  <div className="odc-occ-row">
                    <span className="odc-occ-dot" style={{ background: '#0891b2' }} />
                    <span>Đang có khách</span>
                    <strong style={{ color: '#0891b2' }}>{occupiedRooms}</strong>
                  </div>
                  <hr className="odc-occ-hr" />
                  <div className="odc-occ-row">
                    <span>Tổng phòng</span>
                    <strong>{totalRooms}</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ── Recent Bookings ── */}
      <div className="owner-table-card">
        <div className="owner-table-card__header">
          <p className="owner-table-card__title">Đặt phòng gần đây</p>
          <Link to="/owner/bookings" className="owner-table-card__action">
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>open_in_new</span>
            Xem tất cả
          </Link>
        </div>

        <div className="odc-table-wrap">
          <table className="owner-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Phòng</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}><Sk w="80%" h={16} /></td>
                    ))}
                  </tr>
                ))
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="odc-empty-row">
                    <span className="material-symbols-outlined">inbox</span>
                    <p>Chưa có đặt phòng nào</p>
                  </td>
                </tr>
              ) : recentBookings.map(b => (
                <tr key={b._id}>
                  <td className="odc-code">
                    #{b.bookingCode || b._id?.slice(-6).toUpperCase()}
                  </td>
                  <td>
                    <div className="odc-guest">
                      <span>{b.user?.fullName || 'Khách'}</span>
                      <em>{b.numberOfGuests} khách</em>
                    </div>
                  </td>
                  <td>{b.room?.roomNumber || '—'}</td>
                  <td>{fmtDate(b.checkInDate)}</td>
                  <td>{fmtDate(b.checkOutDate)}</td>
                  <td className="odc-price">{fmtVND(b.totalPrice)}</td>
                  <td><SBadge status={b.status} /></td>
                  <td>
                    <div className="odc-actions">
                      {b.status === 'pending' && <>
                        <button
                          className="odc-btn odc-btn--ok"
                          disabled={actionLoading === b._id}
                          onClick={() => doAction(b._id, 'confirm')}
                          title="Xác nhận">
                          <span className="material-symbols-outlined">check_circle</span>
                        </button>
                        <button
                          className="odc-btn odc-btn--cancel"
                          disabled={actionLoading === b._id}
                          onClick={() => doAction(b._id, 'cancel')}
                          title="Hủy">
                          <span className="material-symbols-outlined">cancel</span>
                        </button>
                      </>}
                      {b.status === 'confirmed' && (
                        <button
                          className="odc-btn odc-btn--in"
                          disabled={actionLoading === b._id}
                          onClick={() => doAction(b._id, 'check-in')}
                          title="Check-in">
                          <span className="material-symbols-outlined">login</span>
                        </button>
                      )}
                      {b.status === 'checked_in' && (
                        <button
                          className="odc-btn odc-btn--out"
                          disabled={actionLoading === b._id}
                          onClick={() => doAction(b._id, 'check-out')}
                          title="Check-out">
                          <span className="material-symbols-outlined">logout</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`owner-toast${toast.type === 'error' ? ' owner-toast--error' : ''}`}>
          <span className="material-symbols-outlined">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}
    </OwnerLayout>
  );
}
