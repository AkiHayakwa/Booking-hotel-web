import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PromotionsPage.css';

const PROVINCES_VN = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const TRENDING_DESTINATIONS = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Nha Trang", "Phú Quốc", "Vũng Tàu", "Hội An"
];

export default function PromotionsPage() {
  const navigate = useNavigate();

  // Search States
  const [destQuery, setDestQuery] = useState('');
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Date States
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);

  const [guests, setGuests] = useState(2);
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

  const filteredDestinations = destQuery.length === 0 
    ? TRENDING_DESTINATIONS 
    : PROVINCES_VN.filter(item =>
        item.toLowerCase().includes(destQuery.toLowerCase())
      );
  
  return (
    <main>
      {/* Hero Section */}
      <section className="promo-hero">
        <div className="promo-hero__overlay"></div>
        <div className="promo-hero__bg" style={{backgroundImage: "url('https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1400&q=80')"}}></div>
        <div className="promo-hero__content">
          <span className="promo-hero__badge">Mùa du lịch rực rỡ</span>
          <h2 className="promo-hero__title">Ưu Đãi Độc Quyền <br/> Dành Cho Bạn</h2>
          <p className="promo-hero__desc">
            Khám phá các chương trình giảm giá lên tới <span className="promo-hero__desc-highlight">50%</span>. 
            Đặt ngay để trải nghiệm kỳ nghỉ trong mơ với mức giá tốt nhất.
          </p>
          <div className="promo-hero__actions">
            <button className="promo-hero__btn" onClick={() => navigate('/hotels')}>
              <span className="material-symbols-outlined">explore</span> Khám phá ngay
            </button>
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <div className="promo-search-container">
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
          
          {/* Nhận phòng */}
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
                  if (newCheckIn >= checkOut) {
                    const nextDay = new Date(new Date(newCheckIn).getTime() + 86400000).toISOString().split('T')[0];
                    setCheckOut(nextDay);
                  }
                }}
              />
            </div>
          </div>
          
          {/* Trả phòng */}
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
                {guests} người · {rooms} phòng
              </div>
              <span className="material-symbols-outlined hp-dropdown-caret">expand_more</span>
            </div>

            {/* Guest & Room Popover */}
            {showGuestDropdown && (
              <div className="hp-dropdown hp-dropdown--guest">
                <div className="hp-guest-row">
                  <span className="hp-guest-label">Số người</span>
                  <div className="hp-counter">
                    <button 
                      className="hp-counter-btn" 
                      onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                      disabled={guests <= 1}
                    >−</button>
                    <span className="hp-counter-val">{guests}</span>
                    <button 
                      className="hp-counter-btn" 
                      onClick={() => setGuests(prev => prev + 1)}
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
          
          {/* Submit */}
          <button 
            onClick={() => navigate('/hotels')}
            className="hp-booking-submit"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Promotions Grid Section */}
      <section className="promo-grid-section">
        <div className="promo-tabs">
          <button className="promo-tab promo-tab--active">
            <span className="material-symbols-outlined">schedule</span> Ưu đãi giờ chót
          </button>
          <button className="promo-tab">
            <span className="material-symbols-outlined">flight_takeoff</span> Combo vé máy bay + khách sạn
          </button>
          <button className="promo-tab">
            <span className="material-symbols-outlined">workspace_premium</span> Thành viên thân thiết
          </button>
        </div>
        
        <div className="promo-grid">
          {/* Promo Card 1 */}
          <div className="promo-card">
            <div className="promo-card__img-wrapper">
              <div className="promo-card__badge">-30%</div>
              <img className="promo-card__img" alt="Đà Nẵng" src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80" />
            </div>
            <div className="promo-card__body">
              <div className="promo-card__date">
                <span className="material-symbols-outlined">calendar_today</span> Hạn dùng: 31/08/2026
              </div>
              <h3 className="promo-card__title">Chào hè tại Đà Nẵng</h3>
              <p className="promo-card__desc">Tận hưởng bãi biển Mỹ Khê tuyệt đẹp với dịch vụ nghỉ dưỡng 5 sao tiêu chuẩn quốc tế.</p>
              <button className="promo-card__btn">Nhận ưu đãi</button>
            </div>
          </div>
          
          {/* Promo Card 2 */}
          <div className="promo-card">
            <div className="promo-card__img-wrapper">
              <div className="promo-card__badge">-40%</div>
              <img className="promo-card__img" alt="Phú Quốc" src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80" />
            </div>
            <div className="promo-card__body">
              <div className="promo-card__date">
                <span className="material-symbols-outlined">calendar_today</span> Hạn dùng: 15/09/2026
              </div>
              <h3 className="promo-card__title">Phú Quốc mộng mơ</h3>
              <p className="promo-card__desc">Khám phá đảo ngọc với gói combo nghỉ dưỡng và lặn ngắm san hô độc quyền.</p>
              <button className="promo-card__btn">Nhận ưu đãi</button>
            </div>
          </div>
          
          {/* Promo Card 3 */}
          <div className="promo-card">
            <div className="promo-card__img-wrapper">
              <div className="promo-card__badge">-25%</div>
              <img className="promo-card__img" alt="Sapa" src="https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80" />
            </div>
            <div className="promo-card__body">
              <div className="promo-card__date">
                <span className="material-symbols-outlined">calendar_today</span> Hạn dùng: 10/10/2026
              </div>
              <h3 className="promo-card__title">Sapa mờ sương</h3>
              <p className="promo-card__desc">Săn mây tại đỉnh Fansipan và trải nghiệm văn hóa bản địa đặc sắc miền núi phía Bắc.</p>
              <button className="promo-card__btn">Nhận ưu đãi</button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="promo-steps">
        <div className="promo-steps__bg-decor"></div>
        <div className="promo-steps__container">
          <div className="promo-steps__header">
            <h2 className="promo-steps__title">Làm thế nào để nhận ưu đãi?</h2>
            <p className="promo-steps__subtitle">Chỉ với 3 bước đơn giản để tận hưởng chuyến đi trong mơ</p>
          </div>
          <div className="promo-steps__grid">
            
            <div className="promo-step">
              <div className="promo-step__icon-wrapper promo-step__icon-wrapper--rotate-r">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <h4 className="promo-step__title">1. Đăng ký tài khoản</h4>
              <p className="promo-step__desc">Tham gia cộng đồng LuxStay để mở khóa các ưu đãi dành riêng cho thành viên.</p>
            </div>
            
            <div className="promo-step">
              <div className="promo-step__icon-wrapper promo-step__icon-wrapper--rotate-l">
                <span className="material-symbols-outlined">search_insights</span>
              </div>
              <h4 className="promo-step__title">2. Chọn ưu đãi</h4>
              <p className="promo-step__desc">Khám phá hàng ngàn khách sạn và combo có nhãn ưu đãi đặc biệt.</p>
            </div>
            
            <div className="promo-step">
              <div className="promo-step__icon-wrapper promo-step__icon-wrapper--rotate-r-more">
                <span className="material-symbols-outlined">celebration</span>
              </div>
              <h4 className="promo-step__title">3. Tận hưởng kỳ nghỉ</h4>
              <p className="promo-step__desc">Xác nhận đặt phòng và chuẩn bị hành lý cho chuyến phiêu lưu tiếp theo của bạn.</p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="promo-newsletter">
        <div className="promo-newsletter__inner">
          <div className="promo-newsletter__content">
            <h3 className="promo-newsletter__title">Nhận ưu đãi sớm nhất!</h3>
            <p className="promo-newsletter__desc">Đăng ký nhận bản tin để không bỏ lỡ bất kỳ chương trình khuyến mãi nào.</p>
          </div>
          <div className="promo-newsletter__form-container">
            <form className="promo-newsletter__form" onSubmit={(e) => e.preventDefault()}>
              <input className="promo-newsletter__input" placeholder="Địa chỉ email của bạn" type="email" required />
              <button className="promo-newsletter__submit" type="submit">Đăng ký ngay</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
