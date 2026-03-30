import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authApi from '../api/authApi';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Nếu không có email (chưa qua OTP verify), chuyển về forgot
  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(email, newPassword);
      setSuccess('Đặt lại mật khẩu thành công! Đang chuyển trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi đặt lại mật khẩu. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrapper">
      {/* Left Image Panel */}
      <div className="login-visual reset-visual">
        <div className="login-visual__overlay"></div>
        <div
          className="login-visual__img"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAg1Ci-mhmhHq2VEUy0Od5Wjq1s7Z8GDlbYv-nAiY-JXQEUhl-81Aw2dD0uumQd0XX_ruf0ihcpbkOUEsRo6kgO3-9JKUEjjRvahflWrvp1fMI0qa1CVBB1GFdMOTKB5zaEnEa0vpcZIcfzIL8uun-avGJPU8mUFFKllm4K3zw1cedw22d0T1Xskdgbsh_iTqv1L_K2ihoxN3x6dpYr7OxilFT8pbQ4zOJj0XBf_vVXr2_ETrztaYpFEV-61FE-FgvINnUViLwVcg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="login-visual__text">
          <h1>Discover Your Perfect Escape</h1>
          <p>Experience luxury like never before with handpicked stays around the globe.</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <div className="reset-container">
          <div className="reset-heading">
            <h2>Đặt lại mật khẩu</h2>
            <p>Vui lòng nhập mật khẩu mới của bạn để hoàn tất quá trình khôi phục.</p>
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

          <form className="reset-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-field__label">Mật khẩu mới</label>
              <div className="form-field__input-wrap">
                <input
                  id="reset-new-password"
                  className="form-field__input form-field__input--icon reset-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="form-field__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="form-field">
              <label className="form-field__label">Xác nhận mật khẩu mới</label>
              <div className="form-field__input-wrap">
                <input
                  id="reset-confirm-password"
                  className="form-field__input form-field__input--icon reset-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="form-field__toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  <span className="material-symbols-outlined">
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              className="reset-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="login-spinner"></span> : 'Cập nhật mật khẩu'}
            </button>

            <div className="reset-back-link">
              <Link to="/login" className="otp-back__link">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
                <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
