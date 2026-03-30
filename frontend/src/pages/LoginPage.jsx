import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Inject Google global callback
    window.handleGoogleCallBackResponse = async (response) => {
      try {
        setLoading(true);
        setError('');
        await googleLogin(response.credential);
        navigate('/');
      } catch (err) {
        setError('Đăng nhập Google thất bại');
      } finally {
        setLoading(false);
      }
    };

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '',
        callback: window.handleGoogleCallBackResponse
      });
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        { theme: 'outline', size: 'large', width: '100%', shape: 'rectangular' }
      );
    }
  }, [googleLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data || 'Đăng nhập thất bại. Kiểm tra lại thông tin.';
      setError(typeof msg === 'string' ? msg : msg.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrapper">
      {/* Left Image Panel */}
      <div className="login-visual">
        <div className="login-visual__overlay"></div>
        <img
          alt="Travel Inspiration"
          className="login-visual__img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRjSLjfAPfKUkMjHhvRq7Bp77EYo521r1CpCosq9RHftjgvlEaGQW01f01azw4vXrMB_1JJ45S3yW1pvZB0pvSvlunvtNb2l6o6F-vOPqJAnbXbPEl5DAbx54dKp4M_hbhOI-m7_MyyzEIufvN7E7b8hzLbA-6GUTkCtSt2Yny7hO9dwNftRleSK3pA7eu-UntHHNBMG31vE7rgkUHSTmq1e5sXH7LcBUD_mz1DUA3fskGBwMQTa9CO49p85EEVz3o-dpNqYsijg"
        />
        <div className="login-visual__text">
          <h1>Hành trình mơ ước của bạn bắt đầu từ đây.</h1>
          <p>Khám phá hàng ngàn điểm đến sang trọng và ưu đãi độc quyền dành riêng cho bạn.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          {/* Heading */}
          <div className="login-heading">
            <h2>Chào mừng trở lại</h2>
            <p>Đăng nhập để tiếp tục kế hoạch cho chuyến đi của bạn</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="alert alert--error">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-field__label">Email</label>
              <input
                id="login-email"
                className="form-field__input"
                type="text"
                placeholder="Nhập địa chỉ email của bạn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="form-field__label">Mật khẩu</label>
              <div className="form-field__input-wrap">
                <input
                  id="login-password"
                  className="form-field__input form-field__input--icon"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              id="login-submit"
              className="login-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="login-spinner"></span> : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider__line"></div>
            <span className="login-divider__text">Hoặc đăng nhập bằng</span>
            <div className="login-divider__line"></div>
          </div>

          {/* Social Login */}
          <div className="login-social" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div ref={googleButtonRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          </div>

          {/* Footer Links */}
          <div className="login-footer-links">
            <Link to="/forgot-password" className="login-footer-links__forgot">Quên mật khẩu?</Link>
            <div className="login-footer-links__register">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="login-footer-links__register-link">Đăng ký ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
