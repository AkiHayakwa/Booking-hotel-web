import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';
import OwnerLayout from '../components/OwnerLayout';
import './OwnerSettingsPage.css';

export default function OwnerSettingsPage() {
  const { user } = useAuth();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validate = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return "Vui lòng điền đủ 3 trường mật khẩu.";
    }
    if (newPassword.length < 6) {
      return "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }
    if (newPassword !== confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }
    if (oldPassword === newPassword) {
      return "Mật khẩu mới không được trùng với mật khẩu cũ.";
    }
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await authApi.changePassword(oldPassword, newPassword);
      setMessage({ type: 'success', text: "Đổi mật khẩu thành công!" });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || err.response?.data || "Sai mật khẩu cũ hoặc có lỗi xảy ra." });
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  return (
    <OwnerLayout>
      <div className="osg-container">
        
        {/* ── Page Header ── */}
        <div className="admin-page-header admin-page-header--row">
          <div>
            <h2 className="admin-page-header__title">Cài đặt & Bảo mật</h2>
            <p className="admin-page-header__sub">Quản lý tài khoản, thay đổi mật khẩu đăng nhập của bạn.</p>
          </div>
        </div>

        <div className="osg-grid">
          {/* Cột 1: Thông tin Read-only */}
          <div className="osg-card">
            <div className="osg-card__header">
              <span className="material-symbols-outlined osg-card__icon">person</span>
              <h2 className="osg-card__title">Hồ Sơ Của Tôi</h2>
            </div>
            
            <div className="osg-card__body">
              <div className="osg-profile-head">
                <div className="osg-avatar">
                  {getInitials(user?.fullName || user?.username)}
                </div>
                <div className="osg-profile-info">
                  <h3>{user?.fullName || user?.username || 'Chưa cung cấp tên'}</h3>
                  <p>{user?.email || 'Chưa cung cấp email'}</p>
                  <span className="osg-role-badge">Tài khoản Host (Owner)</span>
                </div>
              </div>

              <div className="osg-form-group" style={{marginTop: '0.75rem'}}>
                <label className="osg-label">Tên đăng nhập (Username)</label>
                <div className="osg-value-box">{user?.username || '—'}</div>
              </div>

              <div className="osg-form-group">
                <label className="osg-label">Họ và Tên</label>
                <div className="osg-value-box">{user?.fullName || '—'}</div>
              </div>

              <div className="osg-form-group">
                <label className="osg-label">Email liên hệ</label>
                <div className="osg-value-box">{user?.email || '—'}</div>
              </div>

              <p style={{fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem', fontStyle: 'italic', lineHeight: '1.4'}}>
                * Các thông tin tài khoản được đặt ở chế độ Chỉ đọc. Vui lòng liên hệ Bộ phận hỗ trợ nếu muốn thay đổi thông tin pháp lý.
              </p>
            </div>
          </div>

          {/* Cột 2: Đổi mật khẩu */}
          <div className="osg-card">
            <div className="osg-card__header">
              <span className="material-symbols-outlined osg-card__icon" style={{color: '#e11d48'}}>lock_reset</span>
              <h2 className="osg-card__title">Đổi mật khẩu</h2>
            </div>
            
            <div className="osg-card__body">
              {message.text && (
                <div className={`osg-msg osg-msg--${message.type}`}>
                  <span className="material-symbols-outlined">
                    {message.type === 'error' ? 'error' : 'check_circle'}
                  </span>
                  {message.text}
                </div>
              )}

              {user?.googleId && (
                <div className="osg-msg" style={{background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', marginBottom: '1.25rem'}}>
                  <span className="material-symbols-outlined">info</span>
                  Tài khoản của bạn được liên kết với Google. Hệ thống tự động thiết lập một mật khẩu bí mật, bạn vẫn có thể đổi sang mật khẩu tự chọn nếu muốn đăng nhập riêng rẽ.
                </div>
              )}

              <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
                <div className="osg-form-group">
                  <label className="osg-label">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    className="osg-input" 
                    placeholder="••••••••" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>

                <div className="osg-form-group">
                  <label className="osg-label">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    className="osg-input" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>Tối thiểu 6 ký tự. Gợi ý: kết hợp chữ và số.</span>
                </div>

                <div className="osg-form-group">
                  <label className="osg-label">Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    className="osg-input" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="osg-form-footer">
                  <button type="submit" className="osg-btn-submit" disabled={loading}>
                    {loading ? (
                      <><span className="material-symbols-outlined" style={{animation: 'obk-spin 0.65s linear infinite'}}>progress_activity</span> Đang xử lý...</>
                    ) : (
                      <><span className="material-symbols-outlined">save</span> Lưu thay đổi</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </OwnerLayout>
  );
}
