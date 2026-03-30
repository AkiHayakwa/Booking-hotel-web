import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HotelsPage.css';

const PROVINCES_VN = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const TRENDING_DESTINATIONS = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Nha Trang", "Phú Quốc", "Vũng Tàu", "Hội An"
];

export default function HotelsPage() {
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
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen pb-12">
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* Map Toggle */}
            <div className="relative group cursor-pointer overflow-hidden rounded-xl h-24 bg-slate-200">
              <div className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110" data-alt="Map view background" data-location="Danang" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBlxPyuUnegdsKJ1OqQzCWbS61dQg4XF4xYXHT-dyYpcyAQpLeFUoSoa3U4rlVMXSCCWLA9N-Ze0M-GRtSzM0evdijO4o1gw4UYXF1rAJ2SEQJqxZc32pDyZpJVfVBjh39Ln-4y4INR7Pd8f6Cwv69WBP_PQJOi809p0gVBOFl2yOxdcjqXAnY71_bZtzOugNkrfbmuBlrZmrLrfuKsonvbdN3IdTqwHLPPe6u5m6i8BWlI5hldmDEPRqqyIW53kvj-paBVnLiDLg')" }}></div>
              <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                <button className="bg-white px-4 py-2 rounded-lg text-xs font-bold text-primary flex items-center gap-2 shadow-lg">
                  <span className="material-symbols-outlined text-sm">map</span>
                  Xem bản đồ
                </button>
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Khoảng giá</h3>
              <div className="space-y-4">
                <input className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent" max="10000000" min="0" step="500000" type="range" defaultValue="5000000" />
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>0đ</span>
                  <span>10.000.000đ+</span>
                </div>
              </div>
            </div>

            {/* Star Rating */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Hạng sao</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input className="rounded border-slate-300 text-accent focus:ring-accent w-5 h-5" type="checkbox" />
                  <div className="flex text-accent">
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input defaultChecked className="rounded border-slate-300 text-accent focus:ring-accent w-5 h-5" type="checkbox" />
                  <div className="flex text-accent">
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Tiện nghi</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input className="rounded border-slate-300 text-accent focus:ring-accent w-5 h-5" type="checkbox" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Hồ bơi</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input defaultChecked className="rounded border-slate-300 text-accent focus:ring-accent w-5 h-5" type="checkbox" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">WiFi miễn phí</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input className="rounded border-slate-300 text-accent focus:ring-accent w-5 h-5" type="checkbox" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Spa & Massage</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input className="rounded border-slate-300 text-accent focus:ring-accent w-5 h-5" type="checkbox" />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Phòng Gym</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Sorting Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="text-sm text-slate-500">
                Tìm thấy <span className="font-bold text-primary dark:text-white">124 khách sạn</span> tại Đà Nẵng
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Sắp xếp theo:</span>
                <select className="text-sm font-bold bg-background-light dark:bg-slate-800 border-none rounded-lg focus:ring-accent">
                  <option>Phổ biến nhất</option>
                  <option>Giá thấp đến cao</option>
                  <option>Giá cao đến thấp</option>
                  <option>Hạng sao (5 - 1)</option>
                </select>
              </div>
            </div>

            {/* Hotel List */}
            <div className="space-y-6">
              
              {/* Hotel Card 1 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                <div className="w-full md:w-80 h-64 md:h-auto relative">
                  <img className="w-full h-full object-cover" data-alt="Luxury coastal resort in Danang" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiKL-RfqrLfk1skPDGpzJFSbIqBeFSOxd4HdbadiyjuI5ygHS3v4SPo9gvAxF4LIl9YLw-5uAkksnfGimHzE-xmCCaOBzTW3zM7UMdvxsZsu3r4fyX8O3IYxkkRFvcKiAZ2DofWnmScLspOoYbMqMsV0gf6iQ68HUa9hPN-r_qPy3YZe4arsJwEwE06JLzkJb2L-6I_TPojj92v5YkuPrkBya0IJO3TaV8-SKLmUP42vak0HPhPWHIiYztaL3f768uORfyaMkypA" alt="" />
                  <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Khuyến mãi -20%</div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex text-accent mb-1">
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                        </div>
                        <h2 className="text-xl font-bold text-primary dark:text-white leading-tight">InterContinental Danang Sun Peninsula Resort</h2>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span>Bán đảo Sơn Trà, Đà Nẵng</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="bg-primary text-white px-2 py-1 rounded-lg text-sm font-bold">9.5</div>
                        <span className="text-[10px] font-bold text-primary dark:text-slate-400 mt-1 uppercase">Tuyệt vời</span>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">wifi</span>
                        <span className="text-xs">WiFi</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">pool</span>
                        <span className="text-xs">Hồ bơi</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">spa</span>
                        <span className="text-xs">Spa</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">restaurant</span>
                        <span className="text-xs">Bữa sáng</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-400 line-through">12.500.000đ</p>
                      <p className="text-2xl font-bold text-accent">9.800.000đ<span className="text-xs font-normal text-slate-500"> / đêm</span></p>
                    </div>
                    <button className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>

              {/* Hotel Card 2 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                <div className="w-full md:w-80 h-64 md:h-auto relative">
                  <img className="w-full h-full object-cover" data-alt="Modern hotel interior with ocean view" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwfAB2xWphldqnrr1R_JWw4S8lsQAYQy0Zl_MaB_-nijki0_dLjA5lM-BHmbzkrNwURdS_MsP2LHFQbH4lIKiU6eihZ2XWkeBt8z7A7hsZVTk9TyTE0eULUWpbUMpq4HHD4MjvQYlWBmtNS1cE_l71QUf7aH6JA1Y12cC9iYBqqJaA6oUxf6HtHy1y-i3aho3Gj_MJ0YL90V1Xe-DxhTdInYYy5JeP3ghVMUtBkGJsHz8HmW5Jn_iV9QdFWZLUeMf0iC4T834Feg" alt="" />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex text-accent mb-1">
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                        </div>
                        <h2 className="text-xl font-bold text-primary dark:text-white leading-tight">Novotel Danang Han River Hotel</h2>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span>36 Bạch Đằng, Đà Nẵng</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="bg-primary text-white px-2 py-1 rounded-lg text-sm font-bold">8.9</div>
                        <span className="text-[10px] font-bold text-primary dark:text-slate-400 mt-1 uppercase">Rất tốt</span>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">wifi</span>
                        <span className="text-xs">WiFi</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">fitness_center</span>
                        <span className="text-xs">Gym</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">directions_car</span>
                        <span className="text-xs">Đỗ xe</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-2xl font-bold text-accent">2.450.000đ<span className="text-xs font-normal text-slate-500"> / đêm</span></p>
                    </div>
                    <button className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>

              {/* Hotel Card 3 */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                <div className="w-full md:w-80 h-64 md:h-auto relative">
                  <img className="w-full h-full object-cover" data-alt="Luxury resort swimming pool area" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD8Lf4gCOWE7gpviY_-d_Ok3CI8wViBiqcSWO3mr1QigHa_HRtQgz_PixLB6MyJY5vHGrJriE_R9a71ftxN1cyXmi7PyVob0UiSP88JWBvRSfust__0tLOJ8zfUae8xc2y488stnHLDKSAWVxdLstG0Ujya7xXPs08CJ3JUGYUPsMPQfzF5CxBdr1tU9IE8K-fTbV4q71gFVZrQnQzKuegICxCo6rATljwfXuYHcOGm1BD5R5bmltLBQ2tni8IUdl9N3jsffjgoQ" alt="" />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex text-accent mb-1">
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                          <span className="material-symbols-outlined text-sm fill-current">star</span>
                        </div>
                        <h2 className="text-xl font-bold text-primary dark:text-white leading-tight">Sheraton Grand Danang Resort</h2>
                        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span>Trường Sa, Hòa Hải, Đà Nẵng</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="bg-primary text-white px-2 py-1 rounded-lg text-sm font-bold">9.2</div>
                        <span className="text-[10px] font-bold text-primary dark:text-slate-400 mt-1 uppercase">Xuất sắc</span>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">wifi</span>
                        <span className="text-xs">WiFi</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">pool</span>
                        <span className="text-xs">Hồ bơi</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-lg">waves</span>
                        <span className="text-xs">Giáp biển</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-2xl font-bold text-accent">5.120.000đ<span className="text-xs font-normal text-slate-500"> / đêm</span></p>
                    </div>
                    <button className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 pt-8">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium hover:border-primary transition-colors">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium hover:border-primary transition-colors">3</button>
              <span className="text-slate-400 px-2">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium hover:border-primary transition-colors">12</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
