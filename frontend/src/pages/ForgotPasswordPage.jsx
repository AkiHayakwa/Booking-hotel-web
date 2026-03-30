import { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSuccess('Đã gửi link đặt lại mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư.');
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-page__visual">
        <div className="login-page__visual-overlay"></div>
        <img
          src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80"
          alt="Hotel"
          className="login-page__visual-img"
        />
        <div className="login-page__visual-content">
          <h1>Đừng lo lắng</h1>
          <p>Chúng tôi sẽ giúp bạn lấy lại quyền truy cập tài khoản một cách nhanh chóng.</p>
        </div>
      </div>

      <div className="login-page__form-wrapper">
        <div className="login-page__form-container">
          <div className="login-page__heading">
            <h2>Quên mật khẩu</h2>
            <p>Nhập email đã đăng ký để nhận link đặt lại mật khẩu</p>
          </div>

          {error && (
            <div className="alert alert--error">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert--success">
              <span className="material-symbols-outlined">check_circle</span>
              {success}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                id="forgot-email"
                className="form-input"
                type="email"
                placeholder="Nhập địa chỉ email đã đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              id="forgot-submit"
              className="btn btn--primary btn--full btn--lg"
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="btn__spinner"></span> : 'Gửi yêu cầu'}
            </button>
          </form>

          <div className="login-page__footer-links">
            <Link to="/login" className="link link--accent">
              ← Quay lại trang đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
