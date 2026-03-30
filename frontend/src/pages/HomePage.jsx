import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__overlay"></div>
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&q=80"
          alt="Luxury Hotel"
          className="hero__bg"
        />
        <div className="hero__content">
          <h1 className="hero__title">
            Khám phá <span className="hero__title-accent">điểm đến</span> trong mơ
          </h1>
          <p className="hero__subtitle">
            Đặt phòng khách sạn sang trọng với giá tốt nhất. Trải nghiệm dịch vụ đẳng cấp 5 sao.
          </p>
          <div className="hero__actions">
            <Link to="/hotels" className="btn btn--accent btn--lg">
              <span className="material-symbols-outlined">search</span>
              Tìm khách sạn
            </Link>
            {!user && (
              <Link to="/register" className="btn btn--outline-white btn--lg">
                Đăng ký miễn phí
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Tại sao chọn <span className="text-accent">LuxStay</span>?</h2>
        <div className="features__grid">
          <div className="feature-card">
            <div className="feature-card__icon">
              <span className="material-symbols-outlined">hotel</span>
            </div>
            <h3>Khách sạn đa dạng</h3>
            <p>Hàng ngàn khách sạn từ bình dân đến sang trọng, đáp ứng mọi nhu cầu của bạn.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <h3>Đảm bảo chất lượng</h3>
            <p>Tất cả khách sạn đều được kiểm duyệt và đánh giá bởi khách hàng thực.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <h3>Giá tốt nhất</h3>
            <p>Cam kết giá tốt nhất thị trường với nhiều ưu đãi và mã giảm giá hấp dẫn.</p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <h3>Hỗ trợ 24/7</h3>
            <p>Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-section__grid">
          <div className="stat-item">
            <span className="stat-item__number">500+</span>
            <span className="stat-item__label">Khách sạn đối tác</span>
          </div>
          <div className="stat-item">
            <span className="stat-item__number">50K+</span>
            <span className="stat-item__label">Khách hàng tin tưởng</span>
          </div>
          <div className="stat-item">
            <span className="stat-item__number">63</span>
            <span className="stat-item__label">Tỉnh thành</span>
          </div>
          <div className="stat-item">
            <span className="stat-item__number">4.8⭐</span>
            <span className="stat-item__label">Đánh giá trung bình</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-section__content">
          <h2>Sẵn sàng cho chuyến đi tiếp theo?</h2>
          <p>Đăng ký ngay để nhận ưu đãi giảm giá 20% cho lần đặt phòng đầu tiên!</p>
          <Link to="/register" className="btn btn--accent btn--lg">
            Bắt đầu ngay
          </Link>
        </div>
      </section>
    </main>
  );
}
