import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OtpVerifyPage from './pages/OtpVerifyPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import PromotionsPage from './pages/PromotionsPage';
import HotelsPage from './pages/HotelsPage';
import BlogPage from './pages/BlogPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminHotelsPage from './pages/AdminHotelsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminRoomsPage from './pages/AdminRoomsPage';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Admin routes (own layout — no Header/Footer) ── */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/bookings"  element={<AdminBookingsPage />} />
          <Route path="/admin/hotels"    element={<AdminHotelsPage />} />
          <Route path="/admin/users"     element={<AdminUsersPage />} />
          <Route path="/admin/reports"   element={<AdminReportsPage />} />
          <Route path="/admin/rooms"     element={<AdminRoomsPage />} />
          <Route path="/admin/settings"  element={<AdminSettingsPage />} />

          {/* ── Public routes (with Header / Footer) ── */}
          <Route
            path="/*"
            element={
              <div className="app">
                <Header />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/verify-otp" element={<OtpVerifyPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/promotions" element={<PromotionsPage />} />
                  <Route path="/hotels" element={<HotelsPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                </Routes>
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
