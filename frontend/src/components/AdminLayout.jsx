import { Link } from 'react-router-dom';
import './AdminLayout.css';

const NAV_MAIN = [
  { path: '/admin/dashboard', icon: 'dashboard',      label: 'Dashboard' },
  { path: '/admin/bookings',  icon: 'calendar_month', label: 'Bookings'  },
  { path: '/admin/hotels',    icon: 'hotel',          label: 'Hotels'    },
  { path: '/admin/rooms',     icon: 'meeting_room',   label: 'Rooms'     },
  { path: '/admin/users',     icon: 'group',          label: 'Users'     },
  { path: '/admin/reports',   icon: 'bar_chart',      label: 'Reports'   },
];

const AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBAScOIj-MpX-XLp_ZmMRMNsQ0btgESf2Tt7rDsnj9nKVDZiOpaNx0W8TaEXwwCF3iVXFxHg_AkD4v9MDosFt08SGkc85-TbBm7kUcxkvz6TGlflC1H-r2q9KRcMl6F6Zt5Hozi9vuoyWfosNcVNeXSYv26_MbR5Xf3SikZHne0xv3RE9I7sPMfwYHvuabB2Gv4hF5S7g337rk4hrZuOoRD1T2OGukzyPci6k-AU-OPr3-3BNuGXHZi4mgizo7HZwHo4Uninj6peg';

export default function AdminLayout({ activePath, children, searchPlaceholder = 'Search...', onSearch }) {
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

          <Link to="/login" className="admin-sidebar__nav-link admin-sidebar__nav-link--danger">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </Link>
        </nav>

        {/* Profile */}
        <div className="admin-sidebar__profile">
          <div className="admin-sidebar__profile-card">
            <div className="admin-sidebar__avatar">
              <img src={AVATAR_URL} alt="Alexander Reed" />
            </div>
            <div>
              <p className="admin-sidebar__user-name">Alexander Reed</p>
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
                <p className="admin-header__user-name">Alexander Reed</p>
                <p className="admin-header__user-role">Super Admin</p>
              </div>
              <div className="admin-header__avatar">
                <img src={AVATAR_URL} alt="Alexander Reed" />
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
