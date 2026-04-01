import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import publicApi from '../api/publicApi';
import './HotelsPage.css';

const PROVINCES_VN = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn", "Bắc Ninh",
  "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau",
  "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên",
  "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh",
  "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa",
  "Kiên Giang", "Kon Tum", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng",
  "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế",
  "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const TRENDING_DESTINATIONS = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Nha Trang", "Phú Quốc", "Vũng Tàu", "Hội An"
];

// Map amenity.name -> material icon
const AMENITY_ICON_MAP = {
  'WiFi':           'wifi',
  'wifi':           'wifi',
  'Hồ bơi':       'pool',
  'pool':           'pool',
  'Spa':            'spa',
  'spa':            'spa',
  'Gym':            'fitness_center',
  'gym':            'fitness_center',
  'Bữa sáng':    'restaurant',
  'Đỗ xe':        'directions_car',
  'parking':        'directions_car',
  'Giáp biển':    'waves',
  'Bar':            'local_bar',
  'Phòng hội nghị': 'meeting_room',
  'Nhà hàng':      'restaurant',
};

const getAmenityIcon = (amenity) => {
  // amenity sau populate là object {name, icon}
  if (typeof amenity === 'object' && amenity !== null) {
    return amenity.icon || AMENITY_ICON_MAP[amenity.name] || 'check_circle';
  }
  // fallback nếu vẫn là string
  return AMENITY_ICON_MAP[amenity] || 'check_circle';
};

const getAmenityLabel = (amenity) => {
  if (typeof amenity === 'object' && amenity !== null) return amenity.name;
  return amenity;
};

const RATING_LABELS = {
  9: 'Tuyệt vời', 8: 'Rất tốt', 7: 'Tốt', 6: 'Khá tốt'
};
const getRatingLabel = (r) => {
  if (!r) return '';
  if (r >= 9) return 'Tuyệt vời';
  if (r >= 8) return 'Rất tốt';
  if (r >= 7) return 'Tốt';
  return 'Khá tốt';
};

/* ── HotelCard ──────────────────────────────────────────────── */
function HotelCard({ hotel, checkIn, checkOut, guests }) {
  const navigate = useNavigate();
  const coverImg = hotel.images?.[0] || null;
  const minPrice = hotel.minPrice || null;
  // Schema dùng `rating` + `totalReviews`, không có `avgRating`
  const rating   = hotel.rating && hotel.totalReviews > 0
    ? Number(hotel.rating).toFixed(1)
    : null;

  const goDetail = () => {
    const p = new URLSearchParams({ checkIn, checkOut, guests });
    navigate(`/hotels/${hotel._id}?${p.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
      {/* Ảnh */}
      <div className="w-full md:w-80 h-64 md:h-auto relative flex-shrink-0">
        {coverImg ? (
          <img
            className="w-full h-full object-cover"
            src={coverImg}
            alt={hotel.name}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
          style={{ display: coverImg ? 'none' : 'flex' }}
        >
          <span className="material-symbols-outlined text-5xl text-slate-400">apartment</span>
        </div>
        {/* Rating badge góc trên */}
        {rating && (
          <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[11px] font-bold">
            ★ {rating}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0 mr-4">
              {/* Sao */}
              {hotel.stars > 0 && (
                <div className="flex text-accent mb-1">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm fill-current">star</span>
                  ))}
                </div>
              )}
              <h2 className="text-xl font-bold text-primary dark:text-white leading-tight">{hotel.name}</h2>
              <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span>{hotel.address ? `${hotel.address}, ` : ''}{hotel.city}</span>
              </div>
            </div>
            {/* Rating */}
            {rating && (
              <div className="flex flex-col items-end flex-shrink-0">
                <div className="bg-primary text-white px-2 py-1 rounded-lg text-sm font-bold">{rating}</div>
                <span className="text-[10px] font-bold text-primary dark:text-slate-400 mt-1 uppercase">
                  {getRatingLabel(Number(rating))}
                </span>
              </div>
            )}
          </div>

          {/* Amenities — sau populate là object array {name, icon} */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {(hotel.amenities || []).slice(0, 5).map((a, idx) => (
              <div key={idx} className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-lg">{getAmenityIcon(a)}</span>
                <span className="text-xs">{getAmenityLabel(a)}</span>
              </div>
            ))}
          </div>

          {/* Mô tả ngắn */}
          {hotel.description && (
            <p className="text-sm text-slate-500 mt-3 line-clamp-2">{hotel.description}</p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            {minPrice ? (
              <p className="text-2xl font-bold text-accent">
                {Number(minPrice).toLocaleString('vi-VN')}đ
                <span className="text-xs font-normal text-slate-500"> / đêm</span>
              </p>
            ) : (
              <p className="text-sm text-slate-400">Liên hệ để biết giá</p>
            )}
          </div>
          <button
            onClick={goDetail}
            className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN PAGE ──────────────────────────────────────────────── */
export default function HotelsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Đọc params từ URL
  const cityFromUrl = searchParams.get('city') || '';

  // Search form state — khởi tạo từ URL
  const [destQuery, setDestQuery] = useState(cityFromUrl);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [checkIn,  setCheckIn]  = useState(searchParams.get('checkIn')  || today);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || tomorrow);
  const [guests, setGuests]     = useState(Number(searchParams.get('guests')) || 2);
  const [rooms,  setRooms]      = useState(Number(searchParams.get('rooms'))  || 1);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  const destRef  = useRef(null);
  const guestRef = useRef(null);

  // Data state
  const [hotels,  setHotels]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Filter state (client-side)
  const [selectedStars, setSelectedStars] = useState([]);
  const [sortBy, setSortBy] = useState('popular');

  // Close dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (destRef.current  && !destRef.current.contains(e.target))  setShowDestDropdown(false);
      if (guestRef.current && !guestRef.current.contains(e.target)) setShowGuestDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync destQuery khi URL city thay đổi
  useEffect(() => {
    setDestQuery(searchParams.get('city') || '');
    setCheckIn(searchParams.get('checkIn')   || today);
    setCheckOut(searchParams.get('checkOut') || tomorrow);
    setGuests(Number(searchParams.get('guests')) || 2);
    setRooms(Number(searchParams.get('rooms'))  || 1);
  }, [searchParams]);

  // Fetch hotels từ API khi searchParams thay đổi
  useEffect(() => {
    const city = searchParams.get('city');
    setLoading(true);
    setError('');
    const req = city ? publicApi.searchHotels(city) : publicApi.getAllHotels();
    req
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setHotels(data.filter(h => h.isApproved && !h.isDeleted));
      })
      .catch(() => {
        setError('Không thể tải danh sách khách sạn. Vui lòng thử lại.');
        setHotels([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Dropdown gợi ý địa điểm
  const filteredDestinations = destQuery.length === 0
    ? TRENDING_DESTINATIONS
    : PROVINCES_VN.filter(item => item.toLowerCase().includes(destQuery.toLowerCase()));

  // Filter: không có field `stars` trong schema → filter theo rating thay thế
  const filtered = hotels
    .filter(h => selectedStars.length === 0 || selectedStars.includes(Math.round(h.rating || 0)))
    .sort((a, b) => {
      const aP = a.minPrice || 0;
      const bP = b.minPrice || 0;
      if (sortBy === 'price_asc')  return aP - bP;
      if (sortBy === 'price_desc') return bP - aP;
      if (sortBy === 'stars')      return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  // Nút tìm kiếm trong form ở trang này
  const handleSearch = () => {
    const params = {};
    if (destQuery.trim()) params.city = destQuery.trim();
    params.checkIn  = checkIn;
    params.checkOut = checkOut;
    params.guests   = guests;
    params.rooms    = rooms;
    setSearchParams(params);   // react-router → trigger useEffect fetch
    setSelectedStars([]);      // reset filter khi search mới
    setSortBy('popular');
  };

  const toggleStar = (s) => {
    setSelectedStars(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen pb-12">
      {/* Search Bar trên đầu */}
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
                  onChange={e => { setDestQuery(e.target.value); setShowDestDropdown(true); }}
                  onFocus={() => setShowDestDropdown(true)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              {showDestDropdown && (
                <div className="hp-dropdown">
                  {destQuery.length === 0 && (
                    <div className="hp-dropdown-header">Các điểm đến thịnh hành</div>
                  )}
                  <div className="hp-dropdown-scroll">
                    {filteredDestinations.length > 0 ? (
                      filteredDestinations.map((dest, idx) => (
                        <div key={idx} className="hp-dropdown-item"
                          onClick={() => { setDestQuery(dest); setShowDestDropdown(false); }}>
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
                <input className="hp-booking-input" type="date"
                  min={today} value={checkIn}
                  onChange={e => {
                    const v = e.target.value;
                    setCheckIn(v);
                    if (v >= checkOut) {
                      setCheckOut(new Date(new Date(v).getTime() + 86400000).toISOString().split('T')[0]);
                    }
                  }} />
              </div>
            </div>

            {/* Trả phòng */}
            <div className="hp-booking-field hp-booking-field--small">
              <label className="hp-booking-label">Trả phòng</label>
              <div className="hp-booking-input-wrapper">
                <span className="material-symbols-outlined hp-booking-icon">event_busy</span>
                <input className="hp-booking-input" type="date"
                  min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : tomorrow}
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)} />
              </div>
            </div>

            {/* Khách & Phòng */}
            <div className="hp-booking-field hp-booking-field--medium" ref={guestRef}>
              <label className="hp-booking-label">Khách & Phòng</label>
              <div className="hp-booking-input-wrapper" onClick={() => setShowGuestDropdown(!showGuestDropdown)} style={{ cursor: 'pointer' }}>
                <span className="material-symbols-outlined hp-booking-icon">group</span>
                <div className="hp-booking-input hp-fake-input">{guests} người · {rooms} phòng</div>
                <span className="material-symbols-outlined hp-dropdown-caret">expand_more</span>
              </div>
              {showGuestDropdown && (
                <div className="hp-dropdown hp-dropdown--guest">
                  <div className="hp-guest-row">
                    <span className="hp-guest-label">Số người</span>
                    <div className="hp-counter">
                      <button className="hp-counter-btn" onClick={() => setGuests(p => Math.max(1, p - 1))} disabled={guests <= 1}>−</button>
                      <span className="hp-counter-val">{guests}</span>
                      <button className="hp-counter-btn" onClick={() => setGuests(p => p + 1)}>+</button>
                    </div>
                  </div>
                  <div className="hp-guest-row">
                    <span className="hp-guest-label">Phòng</span>
                    <div className="hp-counter">
                      <button className="hp-counter-btn" onClick={() => setRooms(p => Math.max(1, p - 1))} disabled={rooms <= 1}>−</button>
                      <span className="hp-counter-val">{rooms}</span>
                      <button className="hp-counter-btn" onClick={() => setRooms(p => p + 1)}>+</button>
                    </div>
                  </div>
                  <hr className="hp-dropdown-divider" />
                  <button className="hp-dropdown-done-btn" onClick={() => setShowGuestDropdown(false)}>Xong</button>
                </div>
              )}
            </div>

            {/* Tìm kiếm */}
            <button onClick={handleSearch} className="hp-booking-submit">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            {/* Star Rating Filter */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Hạng sao</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2].map(s => (
                  <label key={s} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-accent focus:ring-accent w-5 h-5"
                      checked={selectedStars.includes(s)}
                      onChange={() => toggleStar(s)}
                    />
                    <div className="flex text-accent">
                      {Array.from({ length: s }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-sm fill-current">star</span>
                      ))}
                    </div>
                  </label>
                ))}
                {selectedStars.length > 0 && (
                  <button
                    className="text-xs text-primary underline mt-1"
                    onClick={() => setSelectedStars([])}
                  >
                    Xóa bộ lọc sao
                  </button>
                )}
              </div>
            </div>

            {/* Amenities (hiển thị, chưa filter) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Tiện nghi phổ biến</h3>
              <div className="space-y-2">
                {Object.entries(AMENITY_ICON_MAP)
                  .filter(([key]) => !['wifi','pool','spa','gym','parking'].includes(key))
                  .slice(0, 8)
                  .map(([key, icon]) => (
                    <div key={key} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
                      <span className="material-symbols-outlined text-base">{icon}</span>
                      {key}
                    </div>
                  ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Sorting Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="text-sm text-slate-500">
                {loading ? (
                  <span>Đang tìm kiếm...</span>
                ) : (
                  <>
                    Tìm thấy{' '}
                    <span className="font-bold text-primary dark:text-white">
                      {filtered.length} khách sạn
                    </span>
                    {cityFromUrl ? ` tại ${cityFromUrl}` : ''}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Sắp xếp theo:</span>
                <select
                  className="text-sm font-bold bg-background-light dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:ring-accent outline-none"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="price_asc">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                  <option value="stars">Hạng sao (5 - 1)</option>
                </select>
              </div>
            </div>

            {/* Hotel List */}
            <div className="space-y-6">
              {loading ? (
                /* Loading State */
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
                  <span className="material-symbols-outlined text-5xl"
                    style={{ animation: 'spin 1s linear infinite', display: 'block' }}>
                    progress_activity
                  </span>
                  <p className="text-base">Đang tìm kiếm khách sạn{cityFromUrl ? ` tại ${cityFromUrl}` : ''}...</p>
                </div>
              ) : error ? (
                /* Error State */
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
                  <span className="material-symbols-outlined text-5xl text-red-300">error</span>
                  <p className="font-bold text-slate-600">{error}</p>
                  <button onClick={handleSearch} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">
                    Thử lại
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
                  <span className="material-symbols-outlined text-6xl">search_off</span>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
                    Không tìm thấy khách sạn phù hợp
                  </h3>
                  <p className="text-sm text-center max-w-xs">
                    {cityFromUrl
                      ? `Chưa có khách sạn tại "${cityFromUrl}". Hãy thử tìm điểm đến khác.`
                      : 'Thử thay đổi bộ lọc hoặc tìm điểm đến khác.'}
                  </p>
                  {selectedStars.length > 0 && (
                    <button onClick={() => setSelectedStars([])}
                      className="text-sm text-primary underline">
                      Xóa bộ lọc hạng sao
                    </button>
                  )}
                </div>
              ) : (
                /* Hotel Cards từ DB */
                filtered.map(hotel => (
                  <HotelCard
                    key={hotel._id}
                    hotel={hotel}
                    checkIn={searchParams.get('checkIn') || today}
                    checkOut={searchParams.get('checkOut') || tomorrow}
                    guests={searchParams.get('guests') || 2}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
