import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const NAV_MAIN = [
  { path: '/admin/dashboard', icon: 'dashboard',      label: 'Dashboard' },
  { path: '/admin/bookings',  icon: 'calendar_month', label: 'Bookings'  },
  { path: '/admin/hotels',    icon: 'hotel',          label: 'Hotels'    },
  { path: '/admin/rooms',     icon: 'meeting_room',   label: 'Rooms'     },
  { path: '/admin/amenities', icon: 'star',           label: 'Amenities' },
  { path: '/admin/users',     icon: 'group',          label: 'Users'     },
  { path: '/admin/promotions', icon: 'campaign',       label: 'Promotions' },
  { path: '/admin/reviews',    icon: 'reviews',        label: 'Reviews'    },
  { path: '/admin/blogs',     icon: 'article',        label: 'Blogs'     },
  { path: '/admin/reports',   icon: 'bar_chart',      label: 'Reports'   },
];

export default function AdminLayout({ activePath, children, searchPlaceholder = 'Search...', onSearch }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();                        // Xóa token + set user = null
    window.location.href = '/login'; // Full reload để clear state
  };

  const displayName = user?.fullName || user?.username || 'Admin';
  const avatarUrl = user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=c5a059&color=fff`;

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brand-icon">
            <span className="material-symbols-outlined">apartment</span>
          </div>
          <span className="admin-sidebar__brand-name">LuxStay</span>
        </div>

        {/* Nav */}
        <nav className="admin-sidebar__nav">
          {NAV_MAIN.map(({ path, icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`admin-sidebar__nav-link${activePath === path ? ' active' : ''}`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}

          <hr className="admin-sidebar__nav-sep" />

          <Link
            to="/admin/settings"
            className={`admin-sidebar__nav-link${activePath === '/admin/settings' ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>

          {/* Logout button — xóa token trước khi chuyển trang */}
          <button
            onClick={handleLogout}
            className="admin-sidebar__nav-link admin-sidebar__nav-link--danger"
            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </nav>

        {/* Profile */}
        <div className="admin-sidebar__profile">
          <div className="admin-sidebar__profile-card">
            <div className="admin-sidebar__avatar">
              <img src={avatarUrl} alt={displayName} />
            </div>
            <div>
              <p className="admin-sidebar__user-name">{displayName}</p>
              <p className="admin-sidebar__user-role">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header__search">
            <div className="admin-header__search-wrap">
              <span className="material-symbols-outlined admin-header__search-icon">search</span>
              <input
                className="admin-header__search-input"
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch && onSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="admin-header__actions">
            <button className="admin-header__notif-btn" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
              <span className="admin-header__notif-dot" />
            </button>
            <div className="admin-header__sep" />
            <div className="admin-header__user">
              <div className="admin-header__user-info">
                <p className="admin-header__user-name">{displayName}</p>
                <p className="admin-header__user-role">Super Admin</p>
              </div>
              <div className="admin-header__avatar">
                <img src={avatarUrl} alt={displayName} />
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
