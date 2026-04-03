import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import statsApi from '../api/statsApi';
import './AdminReportsPage.css';

export default function AdminReportsPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    avgRating: 0,
    topHotels: [],
    categories: { hotels: 65, resorts: 25, villas: 10 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsApi.getAdminOverview();
        if (response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải báo cáo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const SUMMARY_METRICS = [
    { icon: 'payments',      label: 'Total Revenue',     value: `$${(stats.totalRevenue || 0).toLocaleString()}`, iconCls: 'primary' },
    { icon: 'receipt_long',  label: 'Total Bookings', value: (stats.totalBookings || 0).toString(),    iconCls: 'blue'    },
    { icon: 'group',       label: 'Total Users',        value: (stats.totalUsers || 0).toString(),    iconCls: 'accent'  },
    { icon: 'star', label: 'Average Rating',    value: (stats.avgRating || 0).toString(),       iconCls: 'purple'  },
  ];

  const MONTHLY_STATS = [
    { month: 'Current Month',  bookings: stats.totalBookings, revenue: `$${(stats.totalRevenue || 0).toLocaleString()}`, growth: '+14.2%', up: true },
    { month: 'Last Month',   bookings: Math.floor(stats.totalBookings * 0.8) || 0, revenue: `$${Math.floor((stats.totalRevenue || 0) * 0.8).toLocaleString()}`, growth: '+8.7%',  up: true },
  ];
  return (
    <AdminLayout activePath="/admin/reports" searchPlaceholder="Search analytics, hotels...">
      {/* ── Page Header & Filters ── */}
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h2 className="admin-page-header__title">Reports & Analytics</h2>
          <p className="admin-page-header__sub">Real-time performance overview of platform</p>
        </div>
        <div className="rpt-filter-bar">
          <div className="rpt-filter-select">
            <span className="material-symbols-outlined">calendar_month</span>
            <span>Last 30 Days</span>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
          <button className="rpt-download-btn">
            <span className="material-symbols-outlined">download</span>
            Download Report
          </button>
        </div>
      </div>

      {/* ── Summary Metrics ── */}
      <div className="admin-stats-grid">
        {SUMMARY_METRICS.map(m => (
          <div key={m.label} className="admin-stat-card">
            <div className="admin-stat-card__top">
              <div className={`admin-stat-card__icon admin-stat-card__icon--${m.iconCls}`}>
                <span className="material-symbols-outlined">{m.icon}</span>
              </div>
            </div>
            <p className="admin-stat-card__label">{m.label}</p>
            <p className="admin-stat-card__value">{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Grid ── */}
      <div className="rpt-charts-grid">
        {/* Revenue Chart */}
        <div className="rpt-chart-card rpt-chart-card--main">
          <div className="rpt-chart-header">
            <h4 className="rpt-chart-title">Revenue vs. Target</h4>
            <div className="rpt-chart-legend">
              <div className="rpt-legend-item">
                <span className="rpt-dot rpt-dot--primary"></span>
                <span>Actual Revenue</span>
              </div>
              <div className="rpt-legend-item">
                <span className="rpt-dot rpt-dot--ghost"></span>
                <span>Target</span>
              </div>
            </div>
          </div>
          <div className="rpt-mock-line-chart">
            {/* Visual bars as mock line chart */}
            {[32, 40, 36, 48, 56, 64].map((h, i) => (
              <div key={i} className="rpt-chart-column">
                <div className="rpt-column-bg" style={{ height: `${h}%` }}>
                  <div className="rpt-column-fill" style={{ height: `${h - 10}%` }}></div>
                </div>
                <span className="rpt-column-label">{['Jan','Feb','Mar','Apr','May','Jun'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="rpt-chart-card">
          <h4 className="rpt-chart-title">Bookings by Category</h4>
          <div className="rpt-pie-wrap">
            <div className="rpt-pie-donut">
              <div className="rpt-pie-center">
                <p className="rpt-pie-val">2.4k</p>
                <p className="rpt-pie-sub">Total</p>
              </div>
            </div>
            <div className="rpt-pie-legend">
              <div className="rpt-pie-row">
                <div className="flex items-center gap-2"><span className="rpt-dot rpt-dot--primary"></span> Hotels</div>
                <span className="font-bold">{stats.categories?.hotels || 65}%</span>
              </div>
              <div className="rpt-pie-row">
                <div className="flex items-center gap-2"><span className="rpt-dot rpt-dot--accent"></span> Resorts</div>
                <span className="font-bold">{stats.categories?.resorts || 25}%</span>
              </div>
              <div className="rpt-pie-row">
                <div className="flex items-center gap-2"><span className="rpt-dot rpt-dot--light"></span> Villas</div>
                <span className="font-bold">{stats.categories?.villas || 10}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      <footer className="rpt-footer">
        <p>© 2024 <strong>LuxStay Booking</strong> Admin Portal. Confidential Data.</p>
      </footer>
    </AdminLayout>
  );
}
