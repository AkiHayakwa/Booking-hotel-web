import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo">
          <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"></path>
          </svg>
        </div>
        <Link to="/" className="header__title">LuxStay Booking</Link>
      </div>

      <nav className="header__nav">
        <div className="header__links">
          <Link to="/" className="header__link">Trang chủ</Link>
          <Link to="/hotels" className="header__link">Khách sạn</Link>
          <a href="#" className="header__link">Ưu đãi</a>
          <a href="#" className="header__link">Blog</a>
          <a href="#" className="header__link">Liên hệ</a>
        </div>

        <div className="header__actions">
          {user ? (
            <>
              <span className="header__user-greeting">
                <span className="material-symbols-outlined">person</span>
                Xin chào, <strong>{user.fullName || user.username}</strong>
              </span>
              <button className="btn btn--outline" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="btn btn--primary">Đăng ký</Link>
              <Link to="/login" className="btn btn--outline">Đăng nhập</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
