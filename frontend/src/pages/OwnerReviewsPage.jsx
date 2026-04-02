import { useState, useEffect, useCallback } from 'react';
import OwnerLayout from '../components/OwnerLayout';
import { useOwner } from '../context/OwnerContext';
import ownerApi from '../api/ownerApi';
import './OwnerReviewsPage.css';

/* ─── helpers ─────────────────────────────────── */
const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
});

function Stars({ rating, size = '1rem' }) {
  return (
    <span className="orv-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className="material-symbols-outlined"
          style={{ fontSize: size, color: i <= rating ? '#f59e0b' : '#e2e8f0' }}>
          star
        </span>
      ))}
    </span>
  );
}

/* ─── Rating Distribution Bar ────────────────── */
function RatingBar({ star, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="orv-dist-row">
      <span className="orv-dist-label">{star}★</span>
      <div className="orv-dist-track">
        <div className="orv-dist-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="orv-dist-count">{count}</span>
    </div>
  );
}

/* ══ MAIN PAGE ═══════════════════════════════ */
export default function OwnerReviewsPage() {
  const { hotels, selectedHotelId } = useOwner();
  const [activeHotelId, setActiveHotelId] = useState(selectedHotelId || '');

  useEffect(() => {
    if (selectedHotelId && !activeHotelId) setActiveHotelId(selectedHotelId);
  }, [selectedHotelId]);

  const activeHotel = hotels.find(h => h._id === activeHotelId) || null;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchReviews = useCallback(async () => {
    if (!activeHotelId) { setReviews([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await ownerApi.getReviews(activeHotelId);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [activeHotelId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  /* ── Derived Stats ── */
  const total = reviews.length;
  const avgRating = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total) : 0;
  const dist = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter(r => r.rating === s).length,
  }));

  const filtered = reviews.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = r.user?.fullName || r.user?.username || '';
    return name.toLowerCase().includes(q) || (r.comment || '').toLowerCase().includes(q);
  });

  return (
    <OwnerLayout searchPlaceholder="Tìm đánh giá..." onSearch={setSearch}>
      {/* Header */}
      <div className="admin-page-header">
        <h2 className="admin-page-header__title">Đánh giá</h2>
        <p className="admin-page-header__sub">Xem tất cả đánh giá từ khách hàng</p>
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

      {/* Stats Overview */}
      {!loading && total > 0 && (
        <div className="orv-overview">
          {/* Left: big number */}
          <div className="orv-overview__score">
            <p className="orv-overview__avg">{avgRating.toFixed(1)}</p>
            <Stars rating={Math.round(avgRating)} size="1.3rem" />
            <p className="orv-overview__total">{total} đánh giá</p>
          </div>
          {/* Right: distribution */}
          <div className="orv-overview__dist">
            {dist.map(d => (
              <RatingBar key={d.star} star={d.star} count={d.count} total={total} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <span className="material-symbols-outlined"
            style={{ fontSize: '2rem', animation: 'ort-spin 1s linear infinite', display: 'block' }}>
            progress_activity
          </span>
          <p style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>Đang tải...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ort-empty">
          <span className="material-symbols-outlined">reviews</span>
          <h3>{total === 0 ? 'Chưa có đánh giá nào' : 'Không tìm thấy'}</h3>
          <p>{total === 0 ? 'Các đánh giá sẽ hiển thị sau khi khách hàng đánh giá khách sạn.' : 'Thử từ khóa khác.'}</p>
        </div>
      ) : (
        <div className="orv-list">
          {filtered.map(r => {
            const name = r.user?.fullName || r.user?.username || 'Khách';
            const avatar = r.user?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0891b2&color=fff&size=80`;
            return (
              <div key={r._id} className="orv-card">
                <div className="orv-card__header">
                  <img className="orv-card__avatar" src={avatar} alt={name} />
                  <div className="orv-card__user">
                    <p className="orv-card__name">{name}</p>
                    <p className="orv-card__date">{fmtDate(r.createdAt)}</p>
                  </div>
                  <Stars rating={r.rating} size="1.1rem" />
                </div>
                {r.comment && (
                  <p className="orv-card__comment">{r.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </OwnerLayout>
  );
}
