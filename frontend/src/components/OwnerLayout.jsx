import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOwner } from '../context/OwnerContext';
import './OwnerLayout.css';

const NAV_ITEMS = [
  { path: '/owner/dashboard',  icon: 'dashboard',       label: 'Dashboard'    },
  { path: '/owner/hotel',      icon: 'hotel',           label: 'Khách sạn'   },
  { path: '/owner/room-types', icon: 'category',        label: 'Loại phòng'  },
  { path: '/owner/rooms',      icon: 'meeting_room',    label: 'Phòng'        },
  { path: '/owner/bookings',   icon: 'calendar_month',  label: 'Đặt phòng'   },
  { path: '/owner/promotions', icon: 'local_offer',     label: 'Ưu đãi'      },
  { path: '/owner/reviews',    icon: 'star',            label: 'Đánh giá'    },
];

// Header bar phía trên hiện tên KS + badge trạng thái duyệt
function OwnerHeader({ searchPlaceholder, onSearch }) {
  const { hotel } = useOwner();
  const { user, logout } = useAuth();

  const displayName = user?.fullName || user?.username || 'Owner';

  return (
    <header className="owner-header">
      <div className="owner-header__search">
        <div className="owner-header__search-wrap">
          <span className="material-symbols-outlined owner-header__search-icon">search</span>
          <input
            className="owner-header__search-input"
            type="text"
            placeholder={searchPlaceholder || 'Tìm kiếm...'}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="owner-header__right">
        {/* Badge trạng thái KS */}
        {hotel && (
          <div className={`owner-hotel-badge ${hotel.isApproved ? 'owner-hotel-badge--approved' : 'owner-hotel-badge--pending'}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
              {hotel.isApproved ? 'verified' : 'schedule'}
            </span>
            {hotel.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
          </div>
        )}

        <div className="owner-header__sep" />

        {/* Avatar + tên */}
        <div className="owner-header__user">
          <div className="owner-header__user-info">
            <p className="owner-header__user-name">{displayName}</p>
            <p className="owner-header__user-role">Hotel Owner</p>
          </div>
          <div className="owner-header__avatar">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0891b2&color=fff`}
              alt={displayName}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// Nội dung sidebar (cần useLocation bên trong OwnerProvider)
function SidebarContent() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hotel, hotels, selectedHotelId, setSelectedHotelId } = useOwner();

  const displayName = user?.fullName || user?.username || 'Owner';
  const avatarUrl = user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0891b2&color=fff`;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="owner-sidebar">
      {/* Brand */}
      <div className="owner-sidebar__brand">
        <div className="owner-sidebar__brand-icon">
          <span className="material-symbols-outlined">hotel</span>
        </div>
        <div>
          <span className="owner-sidebar__brand-name">LuxStay</span>
          <span className="owner-sidebar__brand-sub">Owner Portal</span>
        </div>
      </div>

      {/* Tên KS đang quản lý — dropdown khi có nhiều KS */}
      {hotels.length > 0 && (
        <div className="owner-sidebar__hotel-info">
          <span className="material-symbols-outlined owner-sidebar__hotel-icon">apartment</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {hotels.length === 1 ? (
              /* Chỉ 1 KS → hiển thị tĩnh */
              <>
                <p className="owner-sidebar__hotel-name">{hotel?.name}</p>
                <p className="owner-sidebar__hotel-city">{hotel?.city}</p>
              </>
            ) : (
              /* Nhiều KS → dropdown chọn */
              <select
                className="owner-sidebar__hotel-select"
                value={selectedHotelId || ''}
                onChange={e => setSelectedHotelId(e.target.value)}
                title="Chọn khách sạn đang quản lý"
              >
                {hotels.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.name}{!h.isApproved ? ' ⏳' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="owner-sidebar__nav">
        {NAV_ITEMS.map(({ path, icon, label }) => {
          const isActive = location.pathname === path;
          // Những routes cần KS đã được approved mới vào được
          const requiresApproval = [
            '/owner/room-types',
            '/owner/rooms',
            '/owner/bookings',
            '/owner/promotions',
            '/owner/reviews',
          ].includes(path);
          const isDisabled = requiresApproval && (!hotel || !hotel.isApproved);

          if (isDisabled) {
            return (
              <span
                key={path}
                className="owner-sidebar__nav-link owner-sidebar__nav-link--disabled"
                title="Cần Admin duyệt khách sạn trước khi sử dụng tính năng này"
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
                <span className="material-symbols-outlined owner-sidebar__nav-lock">lock</span>
              </span>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className={`owner-sidebar__nav-link${isActive ? ' active' : ''}`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}

        <hr className="owner-sidebar__nav-sep" />

        <Link
          to="/owner/settings"
          className={`owner-sidebar__nav-link${location.pathname === '/owner/settings' ? ' active' : ''}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Cài đặt</span>
        </Link>

        <button
          onClick={handleLogout}
          className="owner-sidebar__nav-link owner-sidebar__nav-link--danger"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Đăng xuất</span>
        </button>
      </nav>

      {/* Profile */}
      <div className="owner-sidebar__profile">
        <div className="owner-sidebar__profile-card">
          <div className="owner-sidebar__avatar">
            <img src={avatarUrl} alt={displayName} />
          </div>
          <div>
            <p className="owner-sidebar__user-name">{displayName}</p>
            <p className="owner-sidebar__user-role">Hotel Owner</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Layout chính — OwnerProvider được mount ở App.jsx bên ngoài
export default function OwnerLayout({ children, searchPlaceholder, onSearch }) {
  return (
    <div className="owner-layout">
      <SidebarContent />
      <main className="owner-main">
        <OwnerHeader searchPlaceholder={searchPlaceholder} onSearch={onSearch} />
        <div className="owner-content">
          {children}
        </div>
      </main>
    </div>
  );
}
