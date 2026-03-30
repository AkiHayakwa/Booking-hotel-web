import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import './RegisterPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      // Gửi OTP thay vì đăng ký trực tiếp
      await authApi.sendOtp({
        username: form.username,
        password: form.password,
        email: form.email,
      });
      // Chuyển sang trang OTP, truyền email qua state
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === 'string') {
        setError(msg);
      } else if (msg?.message) {
        setError(msg.message);
      } else if (Array.isArray(msg)) {
        setError(msg.map(e => Object.values(e)[0]).join('. '));
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrapper">
      {/* Left visual panel */}
      <div className="login-visual">
        <div className="login-visual__overlay"></div>
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
          alt="Hotel Resort"
          className="login-visual__img"
        />
        <div className="login-visual__text">
          <h1>Trải nghiệm nghỉ dưỡng đẳng cấp</h1>
          <p>Tạo tài khoản để khám phá những ưu đãi độc quyền và quản lý chuyến đi dễ dàng hơn.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-heading">
            <h2>Tạo tài khoản mới</h2>
            <p>Đăng ký miễn phí và bắt đầu hành trình của bạn</p>
          </div>

          {error && (
            <div className="alert alert--error">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-field__label">Tên đăng nhập</label>
              <input
                id="register-username"
                className="form-field__input"
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-field__label">Email</label>
              <input
                id="register-email"
                className="form-field__input"
                type="email"
                name="email"
                placeholder="Nhập địa chỉ email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-field__label">Mật khẩu</label>
              <div className="form-field__input-wrap">
                <input
                  id="register-password"
                  className="form-field__input form-field__input--icon"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Ít nhất 8 ký tự (chữ hoa, thường, số, đặc biệt)"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="form-field__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">Xác nhận mật khẩu</label>
              <input
                id="register-confirm-password"
                className="form-field__input"
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              id="register-submit"
              className="login-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="login-spinner"></span> : 'Đăng ký'}
            </button>
          </form>

          <div className="login-footer-links">
            <p className="login-footer-links__register">
              Đã có tài khoản?{' '}
              <Link to="/login" className="login-footer-links__register-link">Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
