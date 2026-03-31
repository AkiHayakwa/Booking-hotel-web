import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import bookingApi from '../api/bookingApi';
import statsApi from '../api/statsApi';
import './AdminBookingsPage.css';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0, cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, statsRes] = await Promise.all([
        bookingApi.getAll(),
        statsApi.getAdminOverview()
      ]);
      
      if (bookRes.data) setBookings(bookRes.data);
      if (statsRes.data) {
        setStats({
          total: statsRes.data.totalBookings,
          pending: statsRes.data.pendingBookings,
          confirmed: statsRes.data.confirmedBookings,
          cancelled: statsRes.data.cancelledBookings
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu đặt phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const SUMMARY_STATS = [
    { icon: 'book_online', cls: 'primary', label: 'Total Bookings',  value: stats.total.toLocaleString(), meta: '+8.4% from last month', metaCls: 'up' },
    { icon: 'pending_actions', cls: 'yellow', label: 'Pending Approval', value: stats.pending.toLocaleString(), meta: 'Needs immediate attention', metaCls: '' },
    { icon: 'check_circle', cls: 'green', label: 'Confirmed',       value: stats.confirmed.toLocaleString(), meta: '8.2% conversion rate', metaCls: 'up' },
    { icon: 'cancel', cls: 'red', label: 'Cancelled',       value: stats.cancelled.toLocaleString(), meta: '-2.1% improvement', metaCls: 'down' },
  ];

  const handleUpdateStatus = async (id, action) => {
    if (window.confirm(`Bạn có chắc chắn muốn thực hiện thao tác "${action}" cho đơn đặt phòng này?`)) {
      try {
        if (action === 'confirm') await bookingApi.confirm(id);
        else if (action === 'check-in') await bookingApi.checkIn(id);
        else if (action === 'check-out') await bookingApi.checkOut(id);
        else if (action === 'cancel') await bookingApi.cancel(id);
        
        fetchData(); // Use standardized refresh
      } catch (error) {
        alert('Lỗi khi cập nhật trạng thái: ' + (error.response?.data || error.message));
      }
    }
  };

  const filtered = (bookings || []).filter(b => {
    // Chuyển đổi dữ liệu cho khớp với UI nếu cần
    const customerName = b.user?.fullName || b.user?.username || 'Unknown';
    const hotelName = b.hotel?.name || 'Unknown';
    const bookingId = b._id || '';

    const matchStatus = statusFilter === 'All Statuses' || b.status === statusFilter.toLowerCase();
    const matchSearch = customerName.toLowerCase().includes(search.toLowerCase()) ||
                        bookingId.toLowerCase().includes(search.toLowerCase()) ||
                        hotelName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <AdminLayout 
      activePath="/admin/bookings" 
      searchPlaceholder="Global search..."
      onSearch={(val) => setSearchTerm(val)}
    >
      {/* Stats */}
      <div className="admin-stats-grid">
        {SUMMARY_STATS.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-card__top">
              <div className={`admin-stat-card__icon admin-stat-card__icon--${s.cls}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
            </div>
            <p className="admin-stat-card__label">{s.label}</p>
            <p className="admin-stat-card__value">{loading ? '...' : s.value}</p>
            {s.meta && (
              <p className={`admin-stat-card__meta${s.metaCls ? ` admin-stat-card__meta--${s.metaCls}` : ''}`}>
                {s.metaCls === 'up' && <span className="material-symbols-outlined" style={{fontSize:'1rem'}}>trending_up</span>}
                {s.metaCls === 'down' && <span className="material-symbols-outlined" style={{fontSize:'1rem'}}>trending_down</span>}
                {s.meta}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bk-filter-bar">
        <div className="bk-filter-bar__item bk-filter-bar__item--grow">
          <label className="bk-filter-label">Search Bookings</label>
          <div className="bk-filter-input-wrap">
            <span className="material-symbols-outlined bk-filter-icon">search</span>
            <input
              className="bk-filter-input"
              type="text"
              placeholder="Booking ID, Customer, or Hotel..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="bk-filter-bar__item">
          <label className="bk-filter-label">Status Filter</label>
          <select className="bk-filter-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>All Statuses</option>
            <option>Confirmed</option>
            <option>Pending</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div className="bk-filter-bar__item">
          <label className="bk-filter-label">Date Range</label>
          <div className="bk-filter-input-wrap">
            <span className="material-symbols-outlined bk-filter-icon">calendar_today</span>
            <input className="bk-filter-input" type="text" defaultValue="Oct 01, 2023 - Oct 31, 2023" />
          </div>
        </div>
        <div className="bk-filter-bar__item bk-filter-bar__item--btn">
          <button className="bk-apply-btn">
            <span className="material-symbols-outlined">filter_alt</span>
            Apply Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-card">
        <div className="admin-table-card__header">
          <p className="admin-table-card__title">Recent Bookings List</p>
          <button className="admin-table-card__action">
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th><th>Customer</th><th>Hotel</th>
                <th>Check-In/Out</th><th>Status</th><th>Price</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center">Đang tải dữ liệu...</td></tr>
              ) : filtered.map(b => (
                <tr key={b._id}>
                  <td className="bk-id">#{b._id?.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="bk-customer">
                      <div className="bk-customer__initials">
                        {b.user?.fullName?.charAt(0) || b.user?.username?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="bk-customer__name">{b.user?.fullName || b.user?.username || 'Unknown'}</p>
                        <p className="bk-customer__email">{b.user?.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="bk-hotel-name">{b.hotel?.name || 'Unknown Hotel'}</p>
                    <p className="bk-hotel-room">{b.roomType?.name || 'Standard'}</p>
                  </td>
                  <td>
                    <p className="bk-dates">{new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}</p>
                    <p className="bk-nights">{Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / (1000 * 60 * 60 * 24))} Nights</p>
                  </td>
                  <td><span className={`admin-badge admin-badge--${b.status}`}>{b.status}</span></td>
                  <td className="bk-price">${b.totalAmount?.toLocaleString()}</td>
                  <td>
                    <div className="admin-action-group">
                      {b.status === 'pending' && (
                        <button className="admin-action-btn" title="Confirm" onClick={() => handleUpdateStatus(b._id, 'confirm')}>
                          <span className="material-symbols-outlined">check_circle</span>
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button className="admin-action-btn" title="Check-in" onClick={() => handleUpdateStatus(b._id, 'check-in')}>
                          <span className="material-symbols-outlined">login</span>
                        </button>
                      )}
                      {b.status === 'check_in' && (
                        <button className="admin-action-btn" title="Check-out" onClick={() => handleUpdateStatus(b._id, 'check-out')}>
                          <span className="material-symbols-outlined">logout</span>
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(b.status) && (
                        <button className="admin-action-btn admin-action-btn--delete" title="Cancel" onClick={() => handleUpdateStatus(b._id, 'cancel')}>
                          <span className="material-symbols-outlined">cancel</span>
                        </button>
                      )}
                      <button className="admin-action-btn admin-action-btn--view" title="View Details">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="admin-pagination">
          <p className="admin-pagination__info">Showing 1-{filtered.length} of 1,482 results</p>
          <div className="admin-pagination__controls">
            <button className="admin-pagination__btn" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="admin-pagination__btn active">1</button>
            <button className="admin-pagination__btn">2</button>
            <button className="admin-pagination__btn">3</button>
            <span className="admin-pagination__sep">...</span>
            <button className="admin-pagination__btn">38</button>
            <button className="admin-pagination__btn">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
