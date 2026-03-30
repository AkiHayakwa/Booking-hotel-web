import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
          <div className="login-social">
            <button className="login-social__btn" type="button">
              <img
                alt="Google"
                className="login-social__icon-img"
                onError={(e) => { e.target.src = 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png'; }}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ4-ENOhOJsPMEE9oGBJpdaQJtudRBKpyymhGSIRVTu4i8cg2Y0KnmLKaSruj8oCjmlxi5iJa6IB69u80p1lAn3RXgTud2c-6f_HsgpfebamnzJXWr8B8-E9IN_Tj2vCrMCYGhNOud_ftpetVNm8wJ6H6ziVQaeLrvH1742X0VSNAICg3QXdxq8pEuKZLMZQkfwBwuw6cHZeS13zFGli3CZiWAGVwCXKIr3JOki77CshvhtSg-bC3EkLCNxjQl0cX3eoSX3p47QQ"
              />
            </button>
            <button className="login-social__btn" type="button">
              <svg className="login-social__svg login-social__svg--fb" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
            </button>
            <button className="login-social__btn" type="button">
              <svg className="login-social__svg login-social__svg--apple" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.702z"></path>
              </svg>
            </button>
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
