import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateOwnerRoute({ children }) {
  const { user, loading } = useAuth();

  // Chờ AuthContext xác thực xong — tránh flash redirect
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: '1rem',
        background: '#f1f5f9', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '4px solid #e2e8f0',
          borderTopColor: '#0891b2',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Đang xác thực...</p>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!user) return <Navigate to="/login" replace />;

  // Lấy tên role — hỗ trợ cả object { name } lẫn string
  const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
  if (roleName !== 'hotel_owner') return <Navigate to="/login" replace />;

  return children;
}
