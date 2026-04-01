import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OwnerProvider } from './context/OwnerContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateOwnerRoute from './components/PrivateOwnerRoute';
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
import AdminPromotionsPage from './pages/AdminPromotionsPage';
import AdminBlogsPage from './pages/AdminBlogsPage';
import './index.css';

import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerHotelPage from './pages/OwnerHotelPage';
import OwnerRoomTypesPage from './pages/OwnerRoomTypesPage';
import OwnerRoomsPage from './pages/OwnerRoomsPage';
import OwnerBookingsPage from './pages/OwnerBookingsPage';
import OwnerSettingsPage from './pages/OwnerSettingsPage';

function OwnerWrapper({ children }) {
  return (
    <PrivateOwnerRoute>
      <OwnerProvider>
        {children}
      </OwnerProvider>
    </PrivateOwnerRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Admin routes (own layout — no Header/Footer) ── */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/hotels" element={<AdminHotelsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/rooms" element={<AdminRoomsPage />} />
          <Route path="/admin/promotions" element={<AdminPromotionsPage />} />
          <Route path="/admin/blogs" element={<AdminBlogsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          {/* ── Owner routes — dùng OwnerWrapper thay cho PrivateOwnerRoute ── */}
          {/* OwnerWrapper = PrivateOwnerRoute + OwnerProvider                  */}
          {/* Uncomment từng dòng khi tạo xong page tương ứng                  */}
          <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
          <Route path="/owner/dashboard" element={<OwnerWrapper><OwnerDashboardPage /></OwnerWrapper>} />
          <Route path="/owner/hotel" element={<OwnerWrapper><OwnerHotelPage /></OwnerWrapper>} />
          <Route path="/owner/room-types" element={<OwnerWrapper><OwnerRoomTypesPage /></OwnerWrapper>} />
          <Route path="/owner/rooms" element={<OwnerWrapper><OwnerRoomsPage /></OwnerWrapper>} />
          <Route path="/owner/bookings" element={<OwnerWrapper><OwnerBookingsPage /></OwnerWrapper>} />
          {/* <Route path="/owner/promotions" element={<OwnerWrapper><OwnerPromotionsPage /></OwnerWrapper>} /> */}
          {/* <Route path="/owner/reviews"    element={<OwnerWrapper><OwnerReviewsPage /></OwnerWrapper>} /> */}
          <Route path="/owner/settings" element={<OwnerWrapper><OwnerSettingsPage /></OwnerWrapper>} />

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
