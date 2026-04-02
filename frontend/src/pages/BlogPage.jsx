import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import blogApi from '../api/blogApi';
import './BlogPage.css';

const PROVINCES_VN = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const TRENDING_DESTINATIONS = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Nha Trang", "Phú Quốc", "Vũng Tàu", "Hội An"
];

const CATEGORIES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'news', label: 'Tin tức' },
  { value: 'travel_tips', label: 'Cẩm nang' },
  { value: 'hotel_info', label: 'Khách sạn' },
  { value: 'promotion', label: 'Khuyến mãi' },
  { value: 'review', label: 'Đánh giá' }
];

export default function BlogPage() {
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
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchBlogs = async () => {
    try {
      const res = await blogApi.getAll();
      if (res.data) {
        setBlogs(res.data.filter(b => b.isPublished));
      }
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

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

  // Filter blogs by category
  const filteredBlogs = activeCategory === 'all' 
    ? blogs 
    : blogs.filter(b => b.category === activeCategory);

  // Hero blog = first blog
  const heroBlog = filteredBlogs.length > 0 ? filteredBlogs[0] : null;
  // Grid blogs = rest
  const gridBlogs = filteredBlogs.length > 1 ? filteredBlogs.slice(1) : [];
  // Popular blogs (sidebar) = sorted by commentCount
  const popularBlogs = [...blogs].sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0)).slice(0, 4);
  // All tags from blogs
  const allTags = [...new Set(blogs.flatMap(b => b.tags || []))].slice(0, 12);

  return (
    <div className="blog-page">
      {/* Refined Search Bar */}
      <div className="bg-primary" style={{ background: 'var(--primary)', padding: '1.5rem 1rem', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="hp-booking-form" style={{ marginTop: 0, boxShadow: 'none' }}>
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
      </div>

      {/* Hero Section */}
      {!loading && heroBlog && (
        <section className="blog-hero">
          <div className="blog-hero__card" onClick={() => navigate(`/blog/${heroBlog.slug}`)}>
            <div 
              className="blog-hero__bg"
              style={{ 
                backgroundImage: heroBlog.thumbnail 
                  ? `url('${heroBlog.thumbnail}')` 
                  : `linear-gradient(135deg, rgba(0,31,61,0.8), rgba(212,175,55,0.4))`
              }}
            ></div>
            <div className="blog-hero__overlay">
              <span className="blog-hero__badge">
                {CATEGORIES.find(c => c.value === heroBlog.category)?.label || heroBlog.category}
              </span>
              <h2 className="blog-hero__title">{heroBlog.title}</h2>
              <p className="blog-hero__excerpt">{heroBlog.content?.substring(0, 180)}...</p>
              <button className="blog-hero__cta">
                Đọc bài viết <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Category Pills */}
      <div className="blog-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`blog-cat-pill ${activeCategory === cat.value ? 'blog-cat-pill--active' : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="blog-layout">
        {/* Blog Grid */}
        <div className="blog-main">
          <div className="blog-grid">
            {loading ? (
              <div className="blog-loading">
                <span className="material-symbols-outlined">progress_activity</span>
                <span>Đang tải bài viết...</span>
              </div>
            ) : gridBlogs.length > 0 ? (
              gridBlogs.map(post => (
                <article 
                  key={post._id} 
                  className="blog-card"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  {post.thumbnail ? (
                    <div 
                      className="blog-card__img" 
                      style={{ backgroundImage: `url('${post.thumbnail}')` }}
                    ></div>
                  ) : (
                    <div className="blog-card__img blog-card__img--placeholder">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                  )}
                  <div className="blog-card__body">
                    <div className="blog-card__meta">
                      <span className="blog-card__cat">
                        {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                      </span>
                      <span className="blog-card__date">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <h3 className="blog-card__title">{post.title}</h3>
                    <p className="blog-card__excerpt">{post.content}</p>
                    <span className="blog-card__readmore">
                      Đọc tiếp <span className="material-symbols-outlined">open_in_new</span>
                    </span>
                    {post.author && (
                      <div className="blog-card__author">
                        <div className="blog-card__author-avatar">
                          {(post.author.fullName || post.author.username || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="blog-card__author-name">{post.author.fullName || post.author.username}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))
            ) : filteredBlogs.length <= 1 && !loading ? (
              <div className="blog-empty">
                <span className="material-symbols-outlined">article</span>
                <p className="blog-empty__title">
                  {filteredBlogs.length === 1 ? 'Chưa có thêm bài viết' : 'Chưa có bài viết nào'}
                </p>
                <p className="blog-empty__text">
                  {activeCategory !== 'all' 
                    ? 'Không có bài viết nào trong danh mục này. Hãy thử danh mục khác.' 
                    : 'Các bài viết mới sẽ sớm được cập nhật.'}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="blog-sidebar">
          {/* Popular Posts */}
          {popularBlogs.length > 0 && (
            <div className="blog-sidebar__card">
              <h4 className="blog-sidebar__title">Bài viết phổ biến</h4>
              <div className="blog-popular">
                {popularBlogs.map(post => (
                  <div 
                    key={post._id} 
                    className="blog-popular__item"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    {post.thumbnail ? (
                      <div className="blog-popular__thumb">
                        <img src={post.thumbnail} alt={post.title} />
                      </div>
                    ) : (
                      <div className="blog-popular__thumb blog-popular__thumb--placeholder">
                        <span className="material-symbols-outlined">article</span>
                      </div>
                    )}
                    <div className="blog-popular__info">
                      <h5 className="blog-popular__name">{post.title}</h5>
                      <span className="blog-popular__stats">
                        <span className="material-symbols-outlined">chat</span>
                        {post.commentCount || 0} bình luận
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="blog-sidebar__card">
              <h4 className="blog-sidebar__title">Thẻ phổ biến</h4>
              <div className="blog-tags">
                {allTags.map((tag, idx) => (
                  <span key={idx} className="blog-tag">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter */}
          <div className="blog-newsletter">
            <h4 className="blog-newsletter__title">Nhận tin mới nhất</h4>
            <p className="blog-newsletter__text">
              Đăng ký để nhận các bài viết du lịch hấp dẫn và ưu đãi độc quyền từ LuxStay.
            </p>
            <form className="blog-newsletter__form" onSubmit={e => e.preventDefault()}>
              <input 
                className="blog-newsletter__input" 
                placeholder="Nhập email của bạn" 
                type="email" 
              />
              <button className="blog-newsletter__btn">Đăng ký</button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
