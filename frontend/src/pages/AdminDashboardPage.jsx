import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import statsApi from '../api/statsApi';
import bookingApi from '../api/bookingApi';
import './AdminDashboardPage.css';

// Dữ liệu đặt phòng hiển thị mẫu (Sẽ được thay thế bằng dữ liệu thật)
const BOOKINGS_MOCK = [
  { id: '#BK-8842', customer: 'Julianne Moore', hotel: 'Grand Royal Palm',   dates: 'Oct 12 – 15', status: 'confirmed', price: '$1,250' },
  { id: '#BK-8843', customer: 'Marcus Hertz',   hotel: 'Azure Bay Suites',   dates: 'Oct 14 – 18', status: 'pending',   price: '$890'   },
  { id: '#BK-8844', customer: 'Sarah Jenkins',  hotel: 'Lakeside Retreat',   dates: 'Oct 15 – 16', status: 'cancelled', price: '$320'   },
  { id: '#BK-8845', customer: 'Liam Thompson',  hotel: 'The Obsidian Hotel', dates: 'Oct 18 – 22', status: 'confirmed', price: '$2,100' },
];

const MAP_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLJgLoxrPjK_8tMzNI0pHZgsascmiynS_7WvHPKbuhSPDWskods_qnV_QuV3jWovh3nl1InpBNXTJQrTrx6XAxYYPqY-8d8gOFvRPzdspycL3DM9Lw_M0LywVRbefT4UbBc4LHk3i8pI9m_xThAsgM1_CLgcSx6KvnhSdr6W0Bf86EBjMke1mBTJoE3GY2thBs09uk2uzZ_grqcfSOEiVglg-Q11aQ8jIXoheHtg9J6NOYBqxp1vYfTFk5P4TcjhCAaFVwoHeYeg';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeUsers: 0,
    avgRating: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        statsApi.getAdminOverview(),
        bookingApi.getAll()
      ]);
      
      if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (bookingsRes.data) {
        setRecentBookings(bookingsRes.data.slice(0, 5)); // Lấy 5 đơn mới nhất
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mảng chứa cấu hình hiển thị các thẻ stat
  const statCards = [
    { icon: 'book_online', cls: 'primary', label: 'Total Bookings',  value: stats.totalBookings },
    { icon: 'payments',    cls: 'accent',  label: 'Total Revenue',   value: `$${(stats.totalRevenue || 0).toLocaleString()}` },
    { icon: 'person',      cls: 'blue',    label: 'Total Users',     value: stats.totalUsers },
    { icon: 'star',        cls: 'yellow',  label: 'Average Rating',   value: stats.avgRating, sub: '/ 5.0' },
  ];

  return (
    <AdminLayout activePath="/admin/dashboard" searchPlaceholder="Search bookings, hotels...">
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-card__top">
              <div className={`admin-stat-card__icon admin-stat-card__icon--${s.cls}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
            </div>
            <p className="admin-stat-card__label">{s.label}</p>
            <p className="admin-stat-card__value">
              {loading ? '...' : s.value}
              {s.sub && <span className="dash-rating-sub">{s.sub}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dash-grid">
        {/* Left column */}
        <div className="dash-grid__left">
          {/* Revenue Chart */}
          <div className="admin-table-card dash-chart-card">
            <div className="admin-table-card__header">
              <div>
                <p className="admin-table-card__title">Monthly Earnings</p>
                <p className="dash-chart-sub">Revenue performance over the last 6 months</p>
              </div>
              <select className="dash-chart-select">
                <option>Last 6 Months</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="dash-chart-body">
              <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="dash-chart-svg">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgba(0,31,61,0.18)' }} />
                    <stop offset="100%" style={{ stopColor: 'rgba(0,31,61,0)' }} />
                  </linearGradient>
                </defs>
                <path d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20 L400,100 L0,100 Z" fill="url(#grad)" />
                <path d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20" fill="transparent" stroke="#001f3d" strokeWidth="2" />
                {[{cx:0,cy:80},{cx:100,cy:60},{cx:200,cy:30},{cx:300,cy:50},{cx:400,cy:20}].map((p,i) => (
                  <circle key={i} cx={p.cx} cy={p.cy} r="3.5" fill="#d4af37" />
                ))}
              </svg>
              <div className="dash-chart-months">
                {['JAN','FEB','MAR','APR','MAY','JUN'].map(m => <span key={m}>{m}</span>)}
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="admin-table-card">
            <div className="admin-table-card__header">
              <p className="admin-table-card__title">Recent Bookings</p>
              <button className="admin-table-card__action">View All</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Customer</th><th>Hotel</th><th>Check In/Out</th><th>Status</th><th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-4">Đang tải dữ liệu...</td></tr>
                  ) : recentBookings.length > 0 ? recentBookings.map(b => (
                    <tr key={b._id}>
                      <td className="dash-booking-id">#{b._id?.slice(-6).toUpperCase()}</td>
                      <td className="dash-booking-customer">{b.user?.fullName || 'Khách vãng lai'}</td>
                      <td className="dash-booking-hotel">{b.hotel?.name || '---'}</td>
                      <td className="dash-booking-dates">
                        {new Date(b.checkInDate).toLocaleDateString()} – {new Date(b.checkOutDate).toLocaleDateString()}
                      </td>
                      <td><span className={`admin-badge admin-badge--${b.status}`}>{b.status}</span></td>
                      <td className="dash-booking-price">${(b.totalPrice || 0).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="text-center py-4">Chưa có đơn đặt phòng nào mới.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="dash-grid__right">
          {/* Quick Actions */}
          <div className="dash-quick-actions">
            <h3 className="dash-quick-actions__title">
              <span className="material-symbols-outlined">bolt</span>
              Quick Actions
            </h3>
            <div className="dash-quick-actions__btns">
              <button className="dash-qa-btn dash-qa-btn--accent" onClick={() => navigate('/admin/hotels')}>
                <span className="material-symbols-outlined">add_circle</span>
                Add New Hotel
              </button>
              <button className="dash-qa-btn dash-qa-btn--ghost" onClick={() => navigate('/admin/reports')}>
                <span className="material-symbols-outlined">description</span>
                View All Reports
              </button>
              <button className="dash-qa-btn dash-qa-btn--ghost" onClick={() => navigate('/admin/promotions')}>
                <span className="material-symbols-outlined">campaign</span>
                Manage Promotions
              </button>
            </div>
          </div>

          {/* Spotlight */}
          <div className="dash-spotlight">
            <span className="material-symbols-outlined dash-spotlight__bg-icon">auto_awesome</span>
            <h4 className="dash-spotlight__title">Weekly Spotlight</h4>
            <p className="dash-spotlight__desc">Your premium properties are seeing a 20% uptick in engagement this week.</p>
            <button className="dash-spotlight__btn">Review Data</button>
          </div>

        </div>
      </div>
      {/* Footer */}
      <footer className="dash-footer">
        <p>© 2024 <strong>LuxStay Booking</strong> Admin Panel</p>
        <div className="dash-footer__links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help Center</a>
        </div>
      </footer>
    </AdminLayout>
  );
}
