import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const DESTINATIONS = [
  'TP. Hồ Chí Minh', 'Đà Nẵng', 'Đà Lạt', 'Nha Trang', 'Hà Nội',
  'Hội An', 'Cần Thơ', 'Phú Quốc', 'Vũng Tàu', 'Tây Ninh', 
  'Hạ Long', 'Sapa', 'Huế', 'Quy Nhơn', 'Tuy Hòa', 'Đồng Nai', 'Bình Dương'
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search States
  const [destQuery, setDestQuery] = useState('');
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Date States
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  const destRef = useRef(null);
  const guestRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (destRef.current && !destRef.current.contains(event.target)) {
        setShowDestDropdown(false);
      }
      if (guestRef.current && !guestRef.current.contains(event.target)) {
        setShowGuestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredDestinations = DESTINATIONS.filter(item =>
    item.toLowerCase().includes(destQuery.toLowerCase())
  );

  return (
    <main>
      {/* Hero Section */}
      <section className="hp-hero">
        <div className="hp-hero__bg-container">
          <div className="hp-hero__overlay"></div>
          <img 
            alt="Luxury Resort" 
            className="hp-hero__bg-img" 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1400&q=80"
          />
        </div>
        
        <div className="hp-hero__content">
          <h2 className="hp-hero__title">
            Khám Phá Thiên Đường <br/> Nghỉ Dưỡng Của Bạn
          </h2>
          <p className="hp-hero__subtitle">
            Đặt phòng khách sạn & resort hàng đầu với giá tốt nhất. <br className="hidden-mobile"/> Trải nghiệm dịch vụ đẳng cấp thế giới.
          </p>
          
          {/* Floating Booking Form */}
          <div className="hp-booking-form">
            
            {/* Điểm đến */}
            <div className="hp-booking-field hp-booking-field--large" ref={destRef}>
              <label className="hp-booking-label">Điểm đến</label>
              <div className="hp-booking-input-wrapper">
                <span className="material-symbols-outlined hp-booking-icon">location_on</span>
                <input 
                  className="hp-booking-input" 
                  placeholder="Bạn muốn đến đâu?" 
                  type="text"
                  value={destQuery}
                  onChange={(e) => {
                    setDestQuery(e.target.value);
                    setShowDestDropdown(true);
                  }}
                  onFocus={() => setShowDestDropdown(true)}
                />
              </div>

              {/* Destination Dropdown */}
              {showDestDropdown && (
                <div className="hp-dropdown">
                  <div className="hp-dropdown-item hp-dropdown-item--highlight" onClick={() => { setDestQuery('Xung quanh địa điểm hiện tại'); setShowDestDropdown(false); }}>
                    <span className="material-symbols-outlined">near_me</span>
                    <span className="hp-dropdown-item-text">
                      <strong>Xung quanh địa điểm hiện tại</strong>
                    </span>
                  </div>
                  
                  {destQuery.length === 0 && (
                    <div className="hp-dropdown-header">Các điểm đến thịnh hành</div>
                  )}

                  <div className="hp-dropdown-scroll">
                    {filteredDestinations.length > 0 ? (
                      filteredDestinations.map((dest, idx) => (
                        <div 
                          key={idx} 
                          className="hp-dropdown-item"
                          onClick={() => {
                            setDestQuery(dest);
                            setShowDestDropdown(false);
                          }}
                        >
                          <span className="material-symbols-outlined">location_on</span>
                          <span className="hp-dropdown-item-text">
                            <strong>{dest}</strong>
                            <span className="hp-dropdown-item-sub">Việt Nam</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="hp-dropdown-empty">Không tìm thấy địa điểm phù hợp</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="hp-booking-field hp-booking-field--small">
              <label className="hp-booking-label">Nhận phòng</label>
              <div className="hp-booking-input-wrapper">
                <span className="material-symbols-outlined hp-booking-icon">calendar_month</span>
                <input 
                  className="hp-booking-input" 
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    const newCheckIn = e.target.value;
                    setCheckIn(newCheckIn);
                    
                    // Nếu ngày trả phòng đang nhỏ hơn hoặc bằng ngày nhận phòng mới,
                    // tự động dời ngày trả phòng sang hôm sau của ngày nhận phòng
                    if (newCheckIn >= checkOut) {
                      const nextDay = new Date(new Date(newCheckIn).getTime() + 86400000).toISOString().split('T')[0];
                      setCheckOut(nextDay);
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="hp-booking-field hp-booking-field--small">
              <label className="hp-booking-label">Trả phòng</label>
              <div className="hp-booking-input-wrapper">
                <span className="material-symbols-outlined hp-booking-icon">event_busy</span>
                <input 
                  className="hp-booking-input" 
                  type="date"
                  min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : tomorrow}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>
            
            {/* Khách và Phòng */}
            <div className="hp-booking-field hp-booking-field--medium" ref={guestRef}>
              <label className="hp-booking-label">Khách & Phòng</label>
              <div className="hp-booking-input-wrapper" onClick={() => setShowGuestDropdown(!showGuestDropdown)} style={{cursor: 'pointer'}}>
                <span className="material-symbols-outlined hp-booking-icon">group</span>
                <div className="hp-booking-input hp-fake-input">
                  {adults} người lớn · {children} trẻ em · {rooms} phòng
                </div>
                <span className="material-symbols-outlined hp-dropdown-caret">expand_more</span>
              </div>

              {/* Guest & Room Popover */}
              {showGuestDropdown && (
                <div className="hp-dropdown hp-dropdown--guest">
                  <div className="hp-guest-row">
                    <span className="hp-guest-label">Người lớn</span>
                    <div className="hp-counter">
                      <button 
                        className="hp-counter-btn" 
                        onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                        disabled={adults <= 1}
                      >−</button>
                      <span className="hp-counter-val">{adults}</span>
                      <button 
                        className="hp-counter-btn" 
                        onClick={() => setAdults(prev => prev + 1)}
                      >+</button>
                    </div>
                  </div>

                  <div className="hp-guest-row">
                    <span className="hp-guest-label">Trẻ em</span>
                    <div className="hp-counter">
                      <button 
                        className="hp-counter-btn" 
                        onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                        disabled={children <= 0}
                      >−</button>
                      <span className="hp-counter-val">{children}</span>
                      <button 
                        className="hp-counter-btn" 
                        onClick={() => setChildren(prev => prev + 1)}
                      >+</button>
                    </div>
                  </div>

                  <div className="hp-guest-row">
                    <span className="hp-guest-label">Phòng</span>
                    <div className="hp-counter">
                      <button 
                        className="hp-counter-btn" 
                        onClick={() => setRooms(prev => Math.max(1, prev - 1))}
                        disabled={rooms <= 1}
                      >−</button>
                      <span className="hp-counter-val">{rooms}</span>
                      <button 
                        className="hp-counter-btn" 
                        onClick={() => setRooms(prev => prev + 1)}
                      >+</button>
                    </div>
                  </div>

                  <hr className="hp-dropdown-divider" />
                  
                  <button 
                    className="hp-dropdown-done-btn"
                    onClick={() => setShowGuestDropdown(false)}
                  >
                    Xong
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/hotels')}
              className="hp-booking-submit"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="hp-features">
        <div className="hp-section-header">
          <h3 className="hp-section-title">Tại sao chọn LuxStay Booking?</h3>
          <div className="hp-section-line"></div>
        </div>
        
        <div className="hp-features-grid">
          <div className="hp-feature-card">
            <div className="hp-feature-icon">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <h4 className="hp-feature-title">Giá tốt nhất</h4>
            <p className="hp-feature-desc">Cam kết giá cạnh tranh nhất cho các resort 5 sao cao cấp.</p>
          </div>
          
          <div className="hp-feature-card">
            <div className="hp-feature-icon">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <h4 className="hp-feature-title">Hủy phòng miễn phí</h4>
            <p className="hp-feature-desc">Linh hoạt thay đổi lịch trình với chính sách hủy phòng ưu việt.</p>
          </div>
          
          <div className="hp-feature-card">
            <div className="hp-feature-icon">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <h4 className="hp-feature-title">Hỗ trợ 24/7</h4>
            <p className="hp-feature-desc">Đội ngũ chuyên viên tư vấn luôn sẵn sàng hỗ trợ mọi lúc mọi nơi.</p>
          </div>
          
          <div className="hp-feature-card">
            <div className="hp-feature-icon">
              <span className="material-symbols-outlined">thumb_up</span>
            </div>
            <h4 className="hp-feature-title">Đánh giá thực</h4>
            <p className="hp-feature-desc">Hàng nghìn đánh giá xác thực từ những khách hàng đã trải nghiệm.</p>
          </div>
        </div>
      </section>

      {/* Top Destinations */}
      <section className="hp-destinations">
        <div className="hp-destinations-inner">
          <div className="hp-destinations-header">
            <div>
              <h3 className="hp-section-title">Khám Phá Các Điểm Đến Hàng Đầu</h3>
              <p className="hp-destinations-subtitle">Những thiên đường du lịch được yêu thích nhất tại Việt Nam</p>
            </div>
            <Link to="/destinations" className="hp-destinations-link">Xem tất cả</Link>
          </div>
          
          <div className="hp-destinations-grid">
            <div className="hp-dest-card">
              <img alt="Đà Nẵng" className="hp-dest-img" src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80"/>
              <div className="hp-dest-overlay"></div>
              <div className="hp-dest-content">
                <h4 className="hp-dest-title">Đà Nẵng</h4>
                <p className="hp-dest-count">350+ chỗ nghỉ</p>
              </div>
            </div>
            
            <div className="hp-dest-card">
              <img alt="Phú Quốc" className="hp-dest-img" src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"/>
              <div className="hp-dest-overlay"></div>
              <div className="hp-dest-content">
                <h4 className="hp-dest-title">Phú Quốc</h4>
                <p className="hp-dest-count">210+ chỗ nghỉ</p>
              </div>
            </div>
            
            <div className="hp-dest-card">
              <img alt="Nha Trang" className="hp-dest-img" src="https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800&q=80"/>
              <div className="hp-dest-overlay"></div>
              <div className="hp-dest-content">
                <h4 className="hp-dest-title">Nha Trang</h4>
                <p className="hp-dest-count">185+ chỗ nghỉ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="hp-hotels">
        <div className="hp-section-header" style={{textAlign: 'left', marginBottom: '3rem'}}>
          <h3 className="hp-section-title">Khách Sạn & Resort Ưu Đãi Nhất Hôm Nay</h3>
          <p className="hp-destinations-subtitle">Ưu đãi độc quyền chỉ dành cho thành viên</p>
        </div>
        
        <div className="hp-hotels-grid">
          {/* Hotel 1 */}
          <div className="hp-hotel-card">
            <div className="hp-hotel-img-wrapper">
              <img alt="InterContinental Danang" className="hp-hotel-img" src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80"/>
              <span className="hp-hotel-badge">-30%</span>
            </div>
            <div className="hp-hotel-body">
              <div className="hp-hotel-stars">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <h5 className="hp-hotel-title">InterContinental Danang</h5>
              <p className="hp-hotel-location">
                <span className="material-symbols-outlined">location_on</span> Bán đảo Sơn Trà, Đà Nẵng
              </p>
              <div className="hp-hotel-footer">
                <div>
                  <span className="hp-hotel-price-old">8.500.000đ</span>
                  <span className="hp-hotel-price-new">5.950.000đ</span>
                  <span className="hp-hotel-price-unit">/ đêm</span>
                </div>
                <button className="hp-hotel-btn">Chi tiết</button>
              </div>
            </div>
          </div>
          
          {/* Hotel 2 */}
          <div className="hp-hotel-card">
            <div className="hp-hotel-img-wrapper">
              <img alt="Six Senses Ninh Van Bay" className="hp-hotel-img" src="https://images.unsplash.com/photo-1618140052121-39fc6db33972?w=600&q=80"/>
            </div>
            <div className="hp-hotel-body">
              <div className="hp-hotel-stars">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <h5 className="hp-hotel-title">Six Senses Ninh Van Bay</h5>
              <p className="hp-hotel-location">
                <span className="material-symbols-outlined">location_on</span> Vịnh Ninh Vân, Nha Trang
              </p>
              <div className="hp-hotel-footer">
                <div>
                  <span className="hp-hotel-price-new">12.200.000đ</span>
                  <span className="hp-hotel-price-unit">/ đêm</span>
                </div>
                <button className="hp-hotel-btn">Chi tiết</button>
              </div>
            </div>
          </div>
          
          {/* Hotel 3 */}
          <div className="hp-hotel-card">
            <div className="hp-hotel-img-wrapper">
              <img alt="JW Marriott Phu Quoc" className="hp-hotel-img" src="https://images.unsplash.com/photo-1549294413-26f505494cb3?w=600&q=80"/>
              <span className="hp-hotel-badge">-20%</span>
            </div>
            <div className="hp-hotel-body">
              <div className="hp-hotel-stars">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <h5 className="hp-hotel-title">JW Marriott Phu Quoc</h5>
              <p className="hp-hotel-location">
                <span className="material-symbols-outlined">location_on</span> Bãi Khem, Phú Quốc
              </p>
              <div className="hp-hotel-footer">
                <div>
                  <span className="hp-hotel-price-old">9.200.000đ</span>
                  <span className="hp-hotel-price-new">7.360.000đ</span>
                  <span className="hp-hotel-price-unit">/ đêm</span>
                </div>
                <button className="hp-hotel-btn">Chi tiết</button>
              </div>
            </div>
          </div>
          
          {/* Hotel 4 */}
          <div className="hp-hotel-card">
            <div className="hp-hotel-img-wrapper">
              <img alt="Pullman Vung Tau" className="hp-hotel-img" src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"/>
            </div>
            <div className="hp-hotel-body">
              <div className="hp-hotel-stars">
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
                <span className="material-symbols-outlined">star</span>
              </div>
              <h5 className="hp-hotel-title">Pullman Vung Tau</h5>
              <p className="hp-hotel-location">
                <span className="material-symbols-outlined">location_on</span> Vũng Tàu, BR-VT
              </p>
              <div className="hp-hotel-footer">
                <div>
                  <span className="hp-hotel-price-new">3.500.000đ</span>
                  <span className="hp-hotel-price-unit">/ đêm</span>
                </div>
                <button className="hp-hotel-btn">Chi tiết</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="hp-testimonials">
        <div className="hp-section-header">
          <h3 className="hp-section-title">Khách hàng nói gì về chúng tôi?</h3>
          <div className="hp-section-line"></div>
        </div>
        
        <div className="hp-testimonials-grid">
          <div className="hp-test-card">
            <span className="material-symbols-outlined hp-test-quote-icon">format_quote</span>
            <div className="hp-test-user">
              <img alt="User" className="hp-test-avatar" src="https://ui-avatars.com/api/?name=Hương+Lan&background=001f3d&color=fff"/>
              <div>
                <h6 className="hp-test-name">Hương Lan</h6>
                <p className="hp-test-role">Doanh nhân</p>
              </div>
            </div>
            <p className="hp-test-text">"Dịch vụ tuyệt vời! Tôi đã đặt một căn villa tại Phú Quốc qua LuxStay và trải nghiệm thật sự đẳng cấp. Quy trình đặt phòng nhanh gọn và giá rất ưu đãi."</p>
          </div>
          
          <div className="hp-test-card">
            <span className="material-symbols-outlined hp-test-quote-icon">format_quote</span>
            <div className="hp-test-user">
              <img alt="User" className="hp-test-avatar" src="https://ui-avatars.com/api/?name=Minh+Đức&background=c5a059&color=fff"/>
              <div>
                <h6 className="hp-test-name">Minh Đức</h6>
                <p className="hp-test-role">Travel Blogger</p>
              </div>
            </div>
            <p className="hp-test-text">"Tôi luôn lựa chọn LuxStay cho các chuyến đi công tác và nghỉ dưỡng. Hệ thống khách sạn đa dạng và sự hỗ trợ tận tình từ nhân viên là điều tôi ấn tượng nhất."</p>
          </div>
          
          <div className="hp-test-card">
            <span className="material-symbols-outlined hp-test-quote-icon">format_quote</span>
            <div className="hp-test-user">
              <img alt="User" className="hp-test-avatar" src="https://ui-avatars.com/api/?name=Thùy+Dương&background=001f3d&color=fff"/>
              <div>
                <h6 className="hp-test-name">Thùy Dương</h6>
                <p className="hp-test-role">Marketing Manager</p>
              </div>
            </div>
            <p className="hp-test-text">"Giao diện dễ sử dụng, thanh toán bảo mật. Tôi rất yên tâm khi đặt phòng qua đây cho cả gia đình lớn. Cảm ơn LuxStay Booking rất nhiều!"</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta">
        <div className="hp-cta-inner">
          <div className="hp-cta-overlay"></div>
          <div className="hp-cta-content">
            <h3 className="hp-cta-title">Sẵn sàng cho chuyến đi tiếp theo của bạn?</h3>
            <p className="hp-cta-desc">Đăng ký ngay để nhận ưu đãi độc quyền lên tới 30% và nhiều phần quà hấp dẫn từ các resort đối tác.</p>
            
            {!user ? (
              <div className="hp-cta-actions">
                <input className="hp-cta-input" placeholder="Nhập địa chỉ email của bạn" type="email"/>
                <Link to="/register" className="hp-cta-btn">Đăng ký ngay</Link>
              </div>
            ) : (
              <div className="hp-cta-actions">
                <Link to="/hotels" className="hp-cta-btn hp-cta-btn--large">Khám phá ngay</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
