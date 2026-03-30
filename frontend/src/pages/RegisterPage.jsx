import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    role: '',
  });
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get('/roles').then(res => {
      const filtered = res.data.filter(r => r.name !== 'admin');
      setRoles(filtered);
      if (filtered.length > 0) {
        setForm(prev => ({ ...prev, role: filtered[0]._id }));
      }
    }).catch(() => { });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/auth/register', {
        username: form.username,
        password: form.password,
        email: form.email,
        role: form.role,
      });
      setSuccess('Đăng ký thành công! Đang chuyển trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === 'string') {
        setError(msg);
      } else if (msg?.errors) {
        setError(msg.errors.map(e => e.msg).join('. '));
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* Left visual panel */}
      <div className="login-page__visual">
        <div className="login-page__visual-overlay"></div>
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80"
          alt="Hotel Resort"
          className="login-page__visual-img"
        />
        <div className="login-page__visual-content">
          <h1>Trải nghiệm nghỉ dưỡng đẳng cấp</h1>
          <p>Tạo tài khoản để khám phá những ưu đãi độc quyền và quản lý chuyến đi dễ dàng hơn.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-page__form-wrapper">
        <div className="login-page__form-container">
          <div className="login-page__heading">
            <h2>Tạo tài khoản mới</h2>
            <p>Đăng ký miễn phí và bắt đầu hành trình của bạn</p>
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
              <label className="form-label">Tên đăng nhập</label>
              <input
                id="register-username"
                className="form-input"
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                id="register-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="Nhập địa chỉ email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vai trò</label>
              <select
                id="register-role"
                className="form-input"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name === 'customer' ? 'Khách hàng' : r.name === 'hotel_owner' ? 'Chủ khách sạn' : r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="form-input-wrapper">
                <input
                  id="register-password"
                  className="form-input form-input--has-icon"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="form-input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input
                id="register-confirm-password"
                className="form-input"
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
              className="btn btn--primary btn--full btn--lg"
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="btn__spinner"></span> : 'Đăng ký'}
            </button>
          </form>

          <div className="login-page__footer-links">
            <p>
              Đã có tài khoản?{' '}
              <Link to="/login" className="link link--accent">Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
