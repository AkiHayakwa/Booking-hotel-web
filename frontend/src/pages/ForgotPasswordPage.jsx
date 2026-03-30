import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      // Chuyển sang trang OTP, truyền email + mode forgot
      navigate('/verify-otp', { state: { email, mode: 'forgot' } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi gửi mã OTP. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrapper">
      {/* Left visual */}
      <div className="login-visual">
        <div className="login-visual__overlay"></div>
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"
          alt="Luxury Hotel"
          className="login-visual__img"
        />
        <div className="login-visual__text">
          <h1>Khôi phục tài khoản của bạn</h1>
          <p>Chúng tôi sẽ gửi mã OTP để giúp bạn đặt lại mật khẩu nhanh chóng.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="otp-back">
            <Link to="/login" className="otp-back__link">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </div>

          <div className="login-heading" style={{ textAlign: 'left' }}>
            <h2>Quên mật khẩu</h2>
            <p>Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP xác nhận để bạn đặt lại mật khẩu.</p>
          </div>

          {error && (
            <div className="alert alert--error">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-field__label">Email</label>
              <input
                id="forgot-email"
                className="form-field__input"
                type="email"
                placeholder="Nhập email đã đăng ký"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              className="login-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="login-spinner"></span> : 'Gửi mã OTP'}
            </button>
          </form>

          <div className="login-footer-links">
            <p className="login-footer-links__register">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" className="login-footer-links__register-link">Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
