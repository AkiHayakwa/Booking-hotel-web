import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authApi from '../api/authApi';
import './OtpVerifyPage.css';

export default function OtpVerifyPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const mode = location.state?.mode || 'register'; // 'register' hoặc 'forgot'

  // Nếu không có email, chuyển về trang phù hợp
  useEffect(() => {
    if (!email) {
      navigate(mode === 'forgot' ? '/forgot-password' : '/register');
    }
  }, [email, navigate, mode]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  // Xác nhận OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP 6 số');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'forgot') {
        // Quên mật khẩu: verify OTP rồi chuyển sang trang đặt lại mật khẩu
        await authApi.verifyForgotOtp(email, otpCode);
        setSuccess('Xác thực thành công! Đang chuyển trang...');
        setTimeout(() => navigate('/reset-password', { state: { email } }), 1500);
      } else {
        // Đăng ký: verify OTP rồi tạo tài khoản
        await authApi.verifyOtp(email, otpCode);
        setSuccess('Đăng ký thành công! Đang chuyển trang đăng nhập...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Mã OTP không đúng. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setSuccess('');

    try {
      if (mode === 'forgot') {
        await authApi.resendForgotOtp(email);
      } else {
        await authApi.resendOtp(email);
      }
      setSuccess('Đã gửi lại mã OTP mới tới email của bạn');
      setCountdown(120);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi gửi lại mã OTP');
    }
  };

  if (!email) return null;

  return (
    <main className="login-wrapper">
      {/* Left Image Panel */}
      <div className="login-visual">
        <div className="login-visual__overlay"></div>
        <div
          className="login-visual__img"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPdhdgQ1wl7kL2IIYPNKrswfRpg_5sWAReEN34rI9rRQESyvwaiiaqQTgQGfexGQSF8nO4fkWbPHy9dVV_KDQu593zlYfrZE1ukifMXYg01f5BcdgMNmpu9CbmF5HNKTrnRXU8-yYuk_GLL18XKU48t9zgdB4RWPt2wUQvz4t7-_Kxz1oRkLcAatv2-3paWBNFMJzzgqnkRZG9nYzpipWdDkp4Y3wSMb1VXU1s02qjSR9fG4YWmgkAfZRrxfuD1FBU03xz7BgqCA')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="login-visual__text">
          <h1>
            {mode === 'forgot' ? 'Khôi phục tài khoản' : 'Trải nghiệm nghỉ dưỡng đẳng cấp'}
          </h1>
          <p>
            {mode === 'forgot'
              ? 'An tâm tuyệt đối với bảo mật đa tầng của LuxStay Booking.'
              : 'Khám phá những điểm đến tuyệt vời nhất cùng LuxStay Booking.'}
          </p>
        </div>
      </div>

      {/* Right OTP Form Panel */}
      <div className="login-form-panel">
        <div className="otp-container">
          <div className="otp-back">
            <Link to={mode === 'forgot' ? '/forgot-password' : '/register'} className="otp-back__link">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
              <span>Quay lại {mode === 'forgot' ? 'trang Quên mật khẩu' : 'trang Đăng ký'}</span>
            </Link>
          </div>

          <div className="otp-heading">
            <h2>Xác minh OTP</h2>
            <p>Vui lòng nhập mã OTP 6 số đã được gửi tới email <strong>{email}</strong></p>
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

          <form className="otp-form" onSubmit={handleSubmit}>
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button className="otp-submit-btn" type="submit" disabled={loading}>
              {loading ? <span className="login-spinner"></span> : 'Xác nhận'}
            </button>

            <div className="otp-resend">
              <p>Bạn chưa nhận được mã?</p>
              <button
                type="button"
                className={`otp-resend__btn ${!canResend ? 'otp-resend__btn--disabled' : ''}`}
                onClick={handleResend}
                disabled={!canResend}
              >
                Gửi lại mã {!canResend && <span className="otp-resend__timer">({formatTime(countdown)})</span>}
              </button>
            </div>
          </form>

          <div className="otp-help">
            <p>Cần hỗ trợ? Liên hệ <a href="#" className="otp-help__link">Trung tâm trợ giúp</a></p>
          </div>
        </div>
      </div>
    </main>
  );
}
