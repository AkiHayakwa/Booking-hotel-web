import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BlogPage.css';

const PROVINCES_VN = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const TRENDING_DESTINATIONS = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Nha Trang", "Phú Quốc", "Vũng Tàu", "Hội An"
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
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Refined Search Bar */}
      <div className="bg-primary py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
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
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden group">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "linear-gradient(to top, rgba(0,31,61,0.9), rgba(0,31,61,0.2)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAqOqDi5USkkZTR2HTAnRBiCM5vxVtawvut_stN6C9S9ponqo3pxG8QinFM8BQfsKZc1P8Nf3p7yZfl9qPC1mvlP30o63JukvfecQdLsNmZQfxAKwaeBB5447p2FURqUL0qsUtHuV4WRW8noo2_avAAZWJtIKpDRorabDYqAzT-I2xatsDfBSzj2WhULI7I5gorg8py75viJGjPrH_Uca_VC8J0I2oPLXoOg4QQygvlXBpNBz4DVYWF7S-00kNm4HIbqJ_Kvo7LAA')" }}>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 max-w-3xl">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase bg-accent text-white rounded w-fit">Featured Post</span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">Top 10 Most Luxurious Resorts in Vietnam for 2024</h2>
              <p className="text-white/80 text-lg mb-8 line-clamp-2">Experience the pinnacle of hospitality where traditional Vietnamese charm meets modern architectural marvels. Discover our handpicked selection of elite escapes.</p>
              <div>
                <button className="gold-gradient hover:opacity-90 text-primary font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-all">
                  Read More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Category Pills */}
        <div className="flex gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <button className="whitespace-nowrap px-6 py-2 rounded-full bg-primary text-white font-medium text-sm">All Stories</button>
          <button className="whitespace-nowrap px-6 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-accent text-sm transition-colors">Travel Guides</button>
          <button className="whitespace-nowrap px-6 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-accent text-sm transition-colors">Hotel Reviews</button>
          <button className="whitespace-nowrap px-6 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-accent text-sm transition-colors">Food &amp; Culture</button>
          <button className="whitespace-nowrap px-6 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-accent text-sm transition-colors">Travel Tips</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content: Blog Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Post Card 1 */}
              <article className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 dark:border-slate-800">
                <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB3RErgGE42Po-iC38i9IUq4eCZBNc12jU8E8ujaLyInzK_VDucLfIL8NxZisyZjie_xqivBWOD7i8VeZQGptH3Rf_qOTYFs5i5b-fpFtFIPOB63RH2-xN5TUjCZYn86IK2PP2n7rTEEOilWoe6EZM5RRPnImQt7aZBaMcG7SJYmit2iSEFWewYwFbvpoVCazYhiUmlYZjJuud2dP9BPcL4msKOoErBpBazH9Q-YPIuYTvKKpUc1hbKMx774Jd-NOb51zNEsjc6Mw')" }}></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Travel Guides</span>
                    <span className="text-xs text-slate-400">Oct 12, 2024</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors cursor-pointer">A Guide to Da Nang Nightlife</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">From rooftop bars to the iconic Dragon Bridge, experience the electric energy of Da Nang after sunset...</p>
                  <a className="text-primary dark:text-accent font-bold text-sm flex items-center gap-1" href="#read-more">Read Post <span className="material-symbols-outlined text-xs">open_in_new</span></a>
                </div>
              </article>

              {/* Post Card 2 */}
              <article className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 dark:border-slate-800">
                <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAOoZUBqdSTplwjYCTWaF7m84J16nbBehlHdPqIBbz_CPQE9c10VupvVg-J05qznYMk3GogTtQyzelmTQnRYqrY-Pt9XdMJhpKfCwD44xipz-ZgPmlm-t4_lO3MWO8uhRIN3DvPtfqKs0d-4FjbdYyVjIwEKp7jvegsOE6aApnny34j7yFxU0EZjPfWdWUuXT8XkxOxlJaOLcUAgIBtahiWefKiXoU-kkDBmWwQm_Dguc2zwidJkolg43D_MbA-aQmBmo2qX1NvBA')" }}></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Hotel Reviews</span>
                    <span className="text-xs text-slate-400">Oct 10, 2024</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors cursor-pointer">The Best Spas in Phu Quoc</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">Rejuvenate your soul at these world-class spa retreats situated along the white sands of Phu Quoc island...</p>
                  <a className="text-primary dark:text-accent font-bold text-sm flex items-center gap-1" href="#read-more">Read Post <span className="material-symbols-outlined text-xs">open_in_new</span></a>
                </div>
              </article>

              {/* Post Card 3 */}
              <article className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 dark:border-slate-800">
                <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDMWephWvAreHGtgewV7SbdVx-I11yhh7J-wES1VYlNu9oDl9OVm2Ca9OUz-XiewztW8xIvYZ4cmIhMPMm-vmEe-jxIIaHbwPT7_cUMommJ9WHoBfNNdDxj-M8WOi-uRfMTQ_wYQojtbqw5OAaEbRRGFImGQjUA2X6X45t1GJBQO_b0sdzwIkXS9bjOBL12VVt4K5TNY_zLoKi1NHqT3oyk2-QGIsrxIgSas1sbTFu_3YxVb3dkQoauVi4x59gmyP0DuFdy2hRoSA')" }}></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Food &amp; Culture</span>
                    <span className="text-xs text-slate-400">Oct 08, 2024</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors cursor-pointer">Hidden Gems in Hoi An</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">Walk through the ancient lantern-lit streets and find hidden culinary treasures and craft workshops...</p>
                  <a className="text-primary dark:text-accent font-bold text-sm flex items-center gap-1" href="#read-more">Read Post <span className="material-symbols-outlined text-xs">open_in_new</span></a>
                </div>
              </article>

              {/* Post Card 4 */}
              <article className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-slate-100 dark:border-slate-800">
                <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBEpsX6d4LTGMdrySAQKZuCCdHRLyFtc-dPkcHo4JxTuVEe4eJiIu8KzdV1Xk5ptCCCjLeQArbUWzhIVFBkrOgW8rXt_TeebN_HflL9K9iRIVLuzyc6UnQDCzpTcBAjy2xqSyED7_y-hHEgcNUscQxEoYZTIs6yBtOPRAGl9z1pRPGnbiGlYXrLoIPd-cTIRTsom5WZF41mTLAQmZnpPRHOVxG7k3YN1UMnX9icpnZIZSu1fMiyNVXoigEIGR2YqFwMFB4SQuTyZw')" }}></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Travel Tips</span>
                    <span className="text-xs text-slate-400">Oct 05, 2024</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors cursor-pointer">Exploring Sapa's Valleys</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">Trek through misty mountains and golden rice terraces while learning about the local hill tribe cultures...</p>
                  <a className="text-primary dark:text-accent font-bold text-sm flex items-center gap-1" href="#read-more">Read Post <span className="material-symbols-outlined text-xs">open_in_new</span></a>
                </div>
              </article>
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 text-slate-400 cursor-not-allowed">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded bg-primary text-white font-bold">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 hover:border-primary transition-colors">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 hover:border-primary transition-colors">3</button>
              <button className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 hover:border-primary transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-10">
            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-white mb-4">Search Blog</h4>
              <div className="relative">
                <input className="w-full pl-4 pr-10 py-2.5 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-accent focus:border-accent" placeholder="Search articles..." type="text" />
                <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400">search</span>
              </div>
            </div>

            {/* Popular Posts */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-white mb-6">Most Popular</h4>
              <div className="space-y-6">
                <div className="flex gap-4 items-center group cursor-pointer">
                  <div className="size-16 rounded overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBiH4qfruvUWZ1d6gOUYw4dF83xTxm1_9yUmCOeQJeOWSbjyvw-zRXnN21E32bIJEOfqoob_8q3Fudbbgum7caJDGW9QZqXVM2wgFYM1HSTaiIImctHKjxLDbVZOjq0fVUM2qw4Rnlg2S58F9VIGWKTq9PHVr5o3SWkkNH54XZkZwrJnAiFOnLgbGd0p7yhZX7tD-oGkCTVzgOHnp4OiCkRl1H17IXjsCnI8r7e5C1kFwOxbpPj9opxjL6aJrrs18SAVhmwtWS_Zg')" }}></div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold group-hover:text-accent transition-colors leading-snug">Fine Dining in Saigon: Top Picks</h5>
                    <span className="text-[10px] text-slate-400">4.2k views</span>
                  </div>
                </div>
                <div className="flex gap-4 items-center group cursor-pointer">
                  <div className="size-16 rounded overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBhLs8kSygDEoIWYnVBk8h2Xw9EyimxPBJUMzXbJH-Wev-9JAtmOk69zTj9HiT4W95p5-mpm1qX2_RRmwZLdtS6IGw75NGttg17rTtIoPOC7eA-hQ4p4BduSgBEtweY4sCqy8_s7WGXNW_LxnGIR5Sc9tcjtOVFFGRViyMlWnKGTAvsm2WAN7NPU4mkfp0pQbVHEa0z9zTAWyfsL4VRvYMT8yTKfH_m1pQHB8tBJy-TARi83DQxOBdAp24rPIMX8-dU4bdQolQ-Xg')" }}></div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold group-hover:text-accent transition-colors leading-snug">The Art of Luxury Travel</h5>
                    <span className="text-[10px] text-slate-400">3.8k views</span>
                  </div>
                </div>
                <div className="flex gap-4 items-center group cursor-pointer">
                  <div className="size-16 rounded overflow-hidden flex-shrink-0">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6Mq-zwErhnBVc3WJYVsuYll_86PDtSQVUpoO_k350ne07SbLWyTG6ftTRI1nTCoJVdN6p6rqV11P8UZ3k-p-MyNi7oINQ-Jqwsw3qZU61eNoII8BzDGNnPrWaUI111oxauLjMYmQJtX6bYnHrA-iqTwIr0cV-xoyqMkq_Kr5_6Y6cvlgHmaUkUGvDmbfRgyVYkMtoKfBlwcyoROWVqS4WwqpclVil2nEfUcpfYN5QxyC2cboJUi3laMVUe9w-Xt7Fd4Xornf6MQ')" }}></div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold group-hover:text-accent transition-colors leading-snug">Cruising Ha Long Bay in Style</h5>
                    <span className="text-[10px] text-slate-400">2.9k views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="bg-primary p-8 rounded-xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 gold-gradient opacity-10 blur-3xl rounded-full"></div>
              <h4 className="text-lg font-bold text-white mb-2 relative z-10">Stay Updated</h4>
              <p className="text-slate-300 text-sm mb-6 relative z-10">Join 50k+ travelers receiving our weekly luxury trends and exclusive offers.</p>
              <form className="space-y-3 relative z-10" onSubmit={e => e.preventDefault()}>
                <input className="w-full px-4 py-3 rounded-lg border-none bg-white/10 text-white placeholder:text-slate-400 text-sm focus:ring-accent" placeholder="Your Email Address" type="email" />
                <button className="w-full gold-gradient text-primary font-bold py-3 rounded-lg text-sm shadow-lg hover:brightness-110 transition-all uppercase tracking-widest">Subscribe</button>
              </form>
            </div>

            {/* Ad/CTA */}
            <div className="aspect-square rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8iopOYpQbjKdqnLq4cY4SQS-_bw5BdpRHyVfFK_u7NhZPOrq7dyCE5MGFGXULs60v1FuUO_8_KnIJbnPmLD4-59XPW5Vl21CgTGWB3KeYufGsnA4oHX3PXdWiSJ7q6W9bb40OQEgsTFjqIdISNK6Z0detS-LOWauCEiJhO0lrBO3OfZyi19e_j2pbGQWy28j1r4pQiFA2BaCnqe25Nn34houlskCmyp4wM_bjtGfE6AoO7vFUAvhlPr4y13RKJhnTtJWd8N2RIQ')" }}></div>
              <div className="absolute inset-0 bg-primary/40 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-white text-xs font-bold uppercase mb-2">Member Exclusive</p>
                <h4 className="text-xl font-bold text-white mb-4">Get 20% Off Your First Booking</h4>
                <button className="bg-white text-primary px-6 py-2 rounded font-bold text-xs uppercase tracking-tighter hover:bg-slate-100 transition-colors">Join Club</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
