import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import hotelApi from '../api/hotelApi';
import roomTypeApi from '../api/roomTypeApi';
import roomApi from '../api/roomApi';
import bookingApi from '../api/bookingApi';
import paymentApi from '../api/paymentApi';
import reviewApi from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';
import './HotelDetails.css';

const AMENITY_ICON_MAP = {
  'WiFi': 'wifi', 'wifi': 'wifi',
  'Hồ bơi': 'pool', 'pool': 'pool',
  'Spa': 'spa', 'spa': 'spa',
  'Gym': 'fitness_center', 'gym': 'fitness_center',
  'Bữa sáng': 'restaurant',
  'Đỗ xe': 'directions_car', 'parking': 'directions_car',
  'Giáp biển': 'waves',
  'Bar': 'local_bar',
  'Phòng hội nghị': 'meeting_room',
  'Nhà hàng': 'restaurant',
};

const getAmenityIcon = (amenity) => {
  if (typeof amenity === 'object' && amenity !== null) {
    return amenity.icon || AMENITY_ICON_MAP[amenity.name] || 'check_circle';
  }
  return AMENITY_ICON_MAP[amenity] || 'check_circle';
};

const getAmenityLabel = (amenity) => {
  if (typeof amenity === 'object' && amenity !== null) return amenity.name;
  return amenity;
};

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [physicalRooms, setPhysicalRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Promo
  const promoCode = searchParams.get('promoCode') || '';
  const discountType = searchParams.get('discountType') || '';
  const discountValue = Number(searchParams.get('discountValue')) || 0;
  const promoTitle = searchParams.get('promoTitle') || '';
  const hasPromo = discountValue > 0 && discountType;
  const [showPromo, setShowPromo] = useState(true);

  // Booking
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  // Room search & selection
  const [searched, setSearched] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);

  const { user } = useAuth();
  const [isBooking, setIsBooking] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(null);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [reviewForm, setReviewForm] = useState({ booking: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  // Load hotel data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [hotelRes, roomTypesRes, roomsRes] = await Promise.all([
          hotelApi.getById(id),
          roomTypeApi.getAllByHotel(id),
          roomApi.getAllByHotel(id)
        ]);
        if (hotelRes.data) setHotel(hotelRes.data);
        if (roomTypesRes.data) setRoomTypes(roomTypesRes.data);
        if (roomsRes.data) setPhysicalRooms(roomsRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu khách sạn:", err);
        setError("Không thể tải thông tin khách sạn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      try {
        const res = await reviewApi.getByHotel(id);
        setReviews(Array.isArray(res.data) ? res.data : []);
      } catch { setReviews([]); }
    };
    loadReviews();
  }, [id]);

  // Load eligible bookings (for review form)
  useEffect(() => {
    const loadEligible = async () => {
      if (!id || !user) { setEligibleBookings([]); return; }
      try {
        const res = await reviewApi.getEligibleBookings(id);
        setEligibleBookings(Array.isArray(res.data) ? res.data : []);
      } catch { setEligibleBookings([]); }
    };
    loadEligible();
  }, [id, user]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.booking) { setReviewMsg({ type: 'error', text: 'Vui lòng chọn đơn đặt phòng.' }); return; }
    setIsSubmittingReview(true);
    setReviewMsg(null);
    try {
      await reviewApi.create({
        hotel: id,
        booking: reviewForm.booking,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setReviewMsg({ type: 'success', text: 'Đánh giá của bạn đã được gửi thành công!' });
      setReviewForm({ booking: '', rating: 5, comment: '' });
      // Reload reviews & eligible bookings & hotel data
      const [rvRes, elRes, htRes] = await Promise.all([
        reviewApi.getByHotel(id),
        reviewApi.getEligibleBookings(id),
        hotelApi.getById(id)
      ]);
      setReviews(Array.isArray(rvRes.data) ? rvRes.data : []);
      setEligibleBookings(Array.isArray(elRes.data) ? elRes.data : []);
      if (htRes.data) setHotel(htRes.data);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gửi đánh giá thất bại.';
      setReviewMsg({ type: 'error', text: msg });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  /* ── Helpers ── */
  const calcDiscountedPrice = (originalPrice) => {
    if (!hasPromo || !showPromo) return originalPrice;
    if (discountType === 'percentage') return Math.round(originalPrice * (1 - discountValue / 100));
    if (discountType === 'fixed_amount') return Math.max(0, originalPrice - discountValue);
    return originalPrice;
  };

  const getDiscountLabel = () => {
    if (discountType === 'percentage') return `-${discountValue}%`;
    if (discountType === 'fixed_amount') return `-${discountValue.toLocaleString('vi-VN')}đ`;
    return '';
  };

  const getRoomTypeInfo = (room) => {
    const rtId = typeof room.roomType === 'object' ? room.roomType._id : room.roomType;
    return roomTypes.find(rt => rt._id === rtId) || null;
  };

  const calcNights = () => {
    const diff = Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000);
    return diff > 0 ? diff : 1;
  };

  const handleSearch = async () => {
    try {
      const res = await roomApi.getAvailable(id, checkIn, checkOut, guests);
      const available = Array.isArray(res.data) ? res.data : [];
      const enriched = available.map(r => ({
        ...r,
        rtInfo: r.roomType && typeof r.roomType === 'object' ? r.roomType : getRoomTypeInfo(r)
      })).filter(r => r.rtInfo);
      setFilteredRooms(enriched);
      setSelectedRoomIds([]);
      setSearched(true);
    } catch (err) {
      console.error('Lỗi khi kiểm tra phòng trống:', err);
      setFilteredRooms([]);
      setSearched(true);
    }
  };

  const toggleRoom = (roomId) => {
    setSelectedRoomIds(prev => prev.includes(roomId) ? prev.filter(x => x !== roomId) : [...prev, roomId]);
  };

  const handleBooking = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để tiến hành đặt phòng.");
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    
    // Validate
    if (selectedRoomIds.length === 0) {
      alert("Vui lòng tick chọn ít nhất 1 phòng bạn muốn đặt.");
      return;
    }

    setIsBooking(true);
    try {
      const payload = {
        hotel: hotel._id,
        rooms: selectedRoomIds,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: guests,
        promotionId: hasPromo && showPromo ? searchParams.get('promoId') : null,
        discountAmount: hasPromo && showPromo ? totalDiscount : 0,
        specialRequests: ""
      };
      
      const resBooking = await bookingApi.create(payload);
      const bookingId = resBooking.data._id;

      // Goi Momo
      const resMomo = await paymentApi.createMomoPayment(bookingId, totalPrice);
      if (resMomo.data && resMomo.data.payUrl) {
         window.location.href = resMomo.data.payUrl;
      } else {
         alert("Không thể chuyển hướng sang MoMo lúc này. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      let errMsg = "Lỗi hệ thống khi đặt phòng.";
      if (err.response && err.response.data) {
         if (Array.isArray(err.response.data)) {
            errMsg = Object.values(err.response.data[0])[0];
         } else if (err.response.data.message) {
            errMsg = err.response.data.message;
         }
      }
      alert(errMsg);
    } finally {
      setIsBooking(false);
    }
  };

  /* ── Summary ── */
  const selectedRoomsData = filteredRooms.filter(r => selectedRoomIds.includes(r._id));
  const totalSelectedGuests = selectedRoomsData.reduce((sum, r) => sum + (r.rtInfo?.maxGuests || 0), 0);
  const nights = calcNights();

  const totalOriginalPrice = selectedRoomsData.reduce((sum, r) => sum + (r.rtInfo?.pricePerNight || 0) * nights, 0);
  const totalPrice = selectedRoomsData.reduce((sum, r) => sum + calcDiscountedPrice(r.rtInfo?.pricePerNight || 0) * nights, 0);
  const totalDiscount = totalOriginalPrice - totalPrice;

  const renderStars = (rating) => {
    const rounded = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`material-symbols-outlined ${i < rounded ? 'fill-gold' : ''}`}
            style={i >= rounded ? { color: 'var(--text-light)' } : {}}>star</span>
    ));
  };

  const defaultImg = "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?w=1200&q=80";

  if (loading) {
    return (
      <div className="hd-loading">
        <span className="material-symbols-outlined">progress_activity</span>
        <p>Đang tải thông tin khách sạn...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="hd-error">
        <span className="material-symbols-outlined">error_outline</span>
        <p>{error || "Không tìm thấy khách sạn."}</p>
        <button className="hd-error__btn" onClick={() => navigate('/hotels')}>Trở lại danh sách</button>
      </div>
    );
  }

  const images = hotel.images && hotel.images.length > 0 ? hotel.images : [defaultImg];
  const heroImg = images[0];

  return (
    <div className="hd-page">

      {/* Breadcrumb */}
      <nav className="hd-breadcrumb">
        <Link to="/">Trang chủ</Link><span>/</span>
        <Link to="/hotels">Khách sạn</Link><span>/</span>
        <span className="hd-breadcrumb__current">{hotel.name}</span>
      </nav>

      {/* Hero Gallery */}
      <section className="hd-gallery">
        <div className="hd-gallery__grid">
          <div className="hd-gallery__main" onClick={() => setSliderIndex(0)} style={{ cursor: 'pointer' }}>
            <div className="hd-gallery__overlay"></div>
            <img src={heroImg} alt={hotel.name} />
            <div className="hd-gallery__name">
              {hotel.rating >= 4 && <span className="hd-gallery__badge">Được đánh giá cao</span>}
              <h2 className="hd-gallery__title">{hotel.name}</h2>
            </div>
          </div>
          {images.slice(1, 5).map((src, i) => (
            <div key={i} className="hd-gallery__sub" onClick={() => setSliderIndex(i + 1)} style={{ cursor: 'pointer' }}>
              <img src={src} alt={`Ảnh ${i + 2}`} />
              {i === 3 && images.length > 5 && (
                <div className="hd-gallery__more" onClick={(e) => { e.stopPropagation(); setShowGallery(true); }}>
                  <span className="material-symbols-outlined">grid_view</span>
                  Xem thêm +{images.length - 5} ảnh
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Content: Left Info + Right Sidebar ── */}
      <div className="hd-content">

        {/* ====== LEFT PANEL ====== */}
        <div className="hd-info">
          <div className="hd-stars">
            <div className="hd-stars__icons">{renderStars(hotel.rating)}</div>
            <span style={{ color: 'var(--text-light)' }}>|</span>
            <span className="hd-stars__label">
              {hotel.rating ? `Khách sạn ${Math.round(hotel.rating)} sao` : "Điểm lưu trú tiêu chuẩn"}
            </span>
          </div>

          <div className="hd-location">
            <span className="material-symbols-outlined" style={{ color: 'var(--accent)' }}>location_on</span>
            <span>{hotel.address}, {hotel.city}</span>
            <span className="hd-location__link">Xem bản đồ</span>
          </div>

          <p className="hd-description">
            {hotel.description || "Khách sạn hiện chưa cập nhật mô tả chi tiết."}
          </p>

          {/* ── Khung 1: Tiện nghi ── */}
          <div className="hd-panel">
            <h3 className="hd-panel__title">
              <span className="material-symbols-outlined">apartment</span>
              Tiện nghi đẳng cấp
            </h3>
            {hotel.amenities && hotel.amenities.length > 0 ? (
              <div className="hd-amenities__grid">
                {hotel.amenities.map((am, i) => (
                  <div key={i} className="hd-amenity-card">
                    <span className="material-symbols-outlined">{getAmenityIcon(am)}</span>
                    <span>{getAmenityLabel(am) || "Tiện ích"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="hd-amenities__empty">Khách sạn chưa thiết lập danh sách tiện ích.</p>
            )}
          </div>

          {/* ── Khung 2: Phòng trống (chỉ hiện kết quả sau khi bấm kiểm tra) ── */}
          <div className="hd-panel">
            <h3 className="hd-panel__title">
              <span className="material-symbols-outlined">meeting_room</span>
              Phòng trống {searched ? `(${filteredRooms.length})` : ''}
            </h3>

            {!searched ? (
              <p className="hd-panel__empty">
                Bấm "Kiểm tra phòng trống" ở sidebar để xem các phòng có sẵn.
              </p>
            ) : filteredRooms.length > 0 ? (
              <div className="hd-rooms__list">
                {filteredRooms.map(room => {
                  const rt = room.rtInfo;
                  const original = rt?.pricePerNight || 0;
                  const discounted = calcDiscountedPrice(original);
                  const isDiscounted = hasPromo && showPromo && discounted < original;
                  const isSelected = selectedRoomIds.includes(room._id);
                  return (
                    <div key={room._id}
                      className={`hd-room-select ${isSelected ? 'hd-room-select--checked' : ''}`}
                      onClick={() => toggleRoom(room._id)}>
                      <div className="hd-room-select__checkbox">
                        <span className="material-symbols-outlined">
                          {isSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>
                      <div className="hd-room-select__img">
                        <img src={rt?.images?.[0] || defaultImg} alt={rt?.name} />
                      </div>
                      <div className="hd-room-select__info">
                        <h4 className="hd-room-select__name">Phòng {room.roomNumber} — {rt?.name}</h4>
                        <div className="hd-room-select__meta">
                          <span className="material-symbols-outlined">group</span>
                          Tối đa {rt?.maxGuests} khách
                          <span className="hd-room-select__meta-sep">·</span>
                          <span className="material-symbols-outlined">stairs</span>
                          Tầng {room.floor}
                        </div>
                      </div>
                      <div className="hd-room-select__price">
                        {isDiscounted ? (
                          <>
                            <span className="hd-room-select__price-original">{original.toLocaleString('vi-VN')}đ</span>
                            <span className="hd-room-select__price-discount">{getDiscountLabel()}</span>
                            <span className="hd-room-select__price-final">{discounted.toLocaleString('vi-VN')}đ</span>
                          </>
                        ) : (
                          <span className="hd-room-select__price-final">{original.toLocaleString('vi-VN')}đ</span>
                        )}
                        <span className="hd-room-select__price-unit">/đêm</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="hd-rooms__empty" style={{ gridColumn: 'unset' }}>
                <span className="material-symbols-outlined">search_off</span>
                <p>Không tìm thấy phòng trống phù hợp.</p>
              </div>
            )}
          </div>
        </div>

        {/* ====== RIGHT SIDEBAR ====== */}
        <div className="hd-sidebar">

          {/* Box 1: Lọc phòng */}
          <div className="hd-booking">

            <div className="hd-booking__fields">
              <div className="hd-booking__field">
                <label className="hd-booking__field-label">Ngày nhận &amp; trả phòng</label>
                <div className="hd-booking__date-row">
                  <input type="date" value={checkIn} min={today}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        setCheckOut(new Date(new Date(e.target.value).getTime() + 86400000).toISOString().split('T')[0]);
                      }
                    }}
                  />
                  <span className="hd-booking__date-sep">→</span>
                  <input type="date" value={checkOut}
                    min={new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
              <div className="hd-booking__field">
                <label className="hd-booking__field-label">Khách &amp; Phòng</label>
                <div className="hd-booking__counter-row">
                  <div className="hd-booking__counter-item">
                    <span className="material-symbols-outlined">group</span>
                    <span className="hd-booking__counter-label">Số khách</span>
                    <div className="hd-booking__counter">
                      <button className="hd-booking__counter-btn" disabled={guests <= 1}
                        onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
                      <span className="hd-booking__counter-val">{guests}</span>
                      <button className="hd-booking__counter-btn"
                        onClick={() => setGuests(g => g + 1)}>+</button>
                    </div>
                  </div>
                  <div className="hd-booking__counter-item">
                    <span className="material-symbols-outlined">bedroom_parent</span>
                    <span className="hd-booking__counter-label">Số phòng</span>
                    <div className="hd-booking__counter">
                      <button className="hd-booking__counter-btn" disabled={rooms <= 1}
                        onClick={() => setRooms(r => Math.max(1, r - 1))}>−</button>
                      <span className="hd-booking__counter-val">{rooms}</span>
                      <button className="hd-booking__counter-btn"
                        onClick={() => setRooms(r => r + 1)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button className="hd-booking__submit" onClick={handleSearch}>Kiểm tra phòng trống</button>
            <p className="hd-booking__note">Bạn sẽ chưa bị trừ tiền ở bước này</p>

            <hr className="hd-booking__divider" />
            <div className="hd-booking__guarantee">
              <div className="hd-booking__guarantee-icon">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="hd-booking__guarantee-title">Đảm bảo giá tốt nhất</p>
                <p className="hd-booking__guarantee-sub">Hỗ trợ nhanh chóng, chuyên nghiệp</p>
              </div>
            </div>
          </div>

          {/* Box 2: Tạm tính */}
          <div className="hd-summary">
            {hasPromo && showPromo && (
              <div className="hd-promo-banner">
                <div className="hd-promo-banner__icon">
                  <span className="material-symbols-outlined">local_offer</span>
                </div>
                <div className="hd-promo-banner__info">
                  <span className="hd-promo-banner__label">Ưu đãi đang áp dụng</span>
                  <p className="hd-promo-banner__code">{promoCode || promoTitle} — {getDiscountLabel()}</p>
                </div>
                <button className="hd-promo-banner__dismiss" onClick={() => setShowPromo(false)} title="Bỏ ưu đãi">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            )}

            <h4 className="hd-summary__title">
              <span className="material-symbols-outlined">receipt_long</span>
              Tạm tính
            </h4>

            <div className="hd-summary__stats">
              <div className="hd-summary__stat">
                <span className="material-symbols-outlined">bedroom_parent</span>
                <span>{selectedRoomIds.length} phòng đã chọn</span>
              </div>
              <div className="hd-summary__stat">
                <span className="material-symbols-outlined">group</span>
                <span>{totalSelectedGuests} khách (tối đa)</span>
              </div>
              <div className="hd-summary__stat">
                <span className="material-symbols-outlined">dark_mode</span>
                <span>{nights} đêm</span>
              </div>
            </div>

            <hr className="hd-summary__divider" />

            {selectedRoomsData.length > 0 ? (
              <>
                <div className="hd-summary__items">
                  {selectedRoomsData.map(r => {
                    const original = r.rtInfo?.pricePerNight || 0;
                    const discounted = calcDiscountedPrice(original);
                    return (
                      <div key={r._id} className="hd-summary__item">
                        <span className="hd-summary__item-name">P.{r.roomNumber} — {r.rtInfo?.name}</span>
                        <span className="hd-summary__item-price">{(discounted * nights).toLocaleString('vi-VN')}đ</span>
                      </div>
                    );
                  })}
                </div>

                <hr className="hd-summary__divider" />

                {hasPromo && showPromo && totalPrice > 0 && (
                  <div className="hd-summary__discount-row">
                    <div className="hd-summary__subtotal">
                      <span>Tổng phòng</span>
                      <span>{totalOriginalPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="hd-summary__discount-line">
                      <span>Ưu đãi {getDiscountLabel()}</span>
                      <span className="hd-summary__discount-amount">−{totalDiscount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <hr className="hd-summary__divider" />
                  </div>
                )}

                <div className="hd-summary__total-row">
                  <span className="hd-summary__total-label">Tổng cộng</span>
                  <span className="hd-summary__total-price">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>

                <button 
                  className="hd-summary__cta" 
                  onClick={handleBooking}
                  disabled={isBooking}
                >
                  {isBooking ? 'Đang giao dịch...' : 'Thanh toán MoMo'}
                </button>
              </>
            ) : (
              <>
                <div className="hd-summary__total-row">
                  <span className="hd-summary__total-label">Tổng cộng</span>
                  <span className="hd-summary__total-price">0đ</span>
                </div>
                <p className="hd-summary__empty">Tick chọn phòng để xem tạm tính.</p>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ── Chọn loại phòng (full-width, giữ nguyên như cũ) ── */}
      <section className="hd-rooms">
        <h2 className="hd-rooms__title">Chọn loại phòng</h2>
        {(() => {
          // Lọc ra các loại phòng còn ít nhất 1 phòng trống
          const availableRoomTypes = roomTypes.filter(rt => {
            const rtId = rt._id;
            return physicalRooms.some(r => {
              const rTypeId = typeof r.roomType === 'object' ? r.roomType._id : r.roomType;
              return rTypeId === rtId && r.status === 'available' && r.isActive && !r.isDeleted;
            });
          });

          return (
            <>
              <p className="hd-rooms__subtitle">
                Đa dạng lựa chọn theo nhu cầu — {availableRoomTypes.length} loại phòng hiện có.
              </p>
              <div className="hd-rooms__grid">
                {availableRoomTypes.length > 0 ? availableRoomTypes.map((rt) => {
                  const original = rt.pricePerNight || 0;
                  const discounted = calcDiscountedPrice(original);
                  const isDiscounted = hasPromo && showPromo && discounted < original;
                  return (
                    <div key={rt._id} className="hd-room-card">
                      <div className="hd-room-card__img-wrap">
                        <img src={rt.images && rt.images.length > 0 ? rt.images[0] : defaultImg} alt={rt.name} />
                        <span className="hd-room-card__capacity-badge">Tối đa {rt.maxGuests} người</span>
                      </div>
                      <div className="hd-room-card__body">
                        <h3 className="hd-room-card__name">{rt.name}</h3>
                        <p className="hd-room-card__desc">{rt.description || "Trải nghiệm sự thoải mái với hạng phòng đẳng cấp này."}</p>
                        <div className="hd-room-card__meta">
                          <span className="material-symbols-outlined">group</span>
                          Tối đa {rt.maxGuests} khách
                        </div>
                        <div className="hd-room-card__footer">
                          <div>
                            <span className="hd-room-card__price-label">Mỗi đêm từ</span>
                            {isDiscounted ? (
                              <>
                                <p className="hd-room-card__original-price">{original.toLocaleString('vi-VN')}đ</p>
                                <p className="hd-room-card__price">{discounted.toLocaleString('vi-VN')}đ</p>
                                <span className="hd-room-card__discount-label">{getDiscountLabel()}</span>
                              </>
                            ) : (
                              <p className="hd-room-card__price">{original > 0 ? original.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="hd-rooms__empty">
                    <span className="material-symbols-outlined">hotel</span>
                    <p>Khách sạn hiện không còn phòng trống.</p>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </section>

      {/* Reviews */}
      <section className="hd-reviews">
        <h2 className="hd-reviews__title">Đánh giá từ khách hàng</h2>
        <div className="hd-reviews__grid">
          <div className="hd-reviews__score-card">
            <span className="hd-reviews__score-num">{hotel.rating ? Number(hotel.rating).toFixed(1) : "—"}</span>
            <div className="hd-reviews__score-stars">{renderStars(hotel.rating || 0)}</div>
            <span className="hd-reviews__score-count">Dựa trên {hotel.totalReviews || 0} đánh giá</span>
          </div>
          <div className="hd-reviews__list">
            {reviews.length > 0 ? (
              reviews.map(rv => (
                <div key={rv._id} className="hd-review-card">
                  <div className="hd-review-card__header">
                    <div className="hd-review-card__avatar">
                      {(rv.user?.fullName || rv.user?.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="hd-review-card__name">{rv.user?.fullName || rv.user?.username || 'Khách hàng'}</p>
                      <p className="hd-review-card__date">{new Date(rv.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="hd-review-card__stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={`material-symbols-outlined ${i < rv.rating ? 'fill-gold' : ''}`}
                          style={i >= rv.rating ? { color: '#cbd5e1', fontSize: '0.9rem' } : { fontSize: '0.9rem' }}>star</span>
                      ))}
                    </div>
                  </div>
                  {rv.comment && <p className="hd-review-card__text">"{rv.comment}"</p>}
                </div>
              ))
            ) : (
              <p className="hd-reviews__empty">Chưa có đánh giá nào được ghi nhận.</p>
            )}
          </div>
        </div>

        {/* Form đánh giá - chỉ hiện khi user đăng nhập và có booking đủ điều kiện */}
        {user && eligibleBookings.length > 0 && (
          <div className="hd-review-form">
            <h3 className="hd-review-form__title">
              <span className="material-symbols-outlined">rate_review</span>
              Viết đánh giá của bạn
            </h3>
            <p className="hd-review-form__sub">Bạn có {eligibleBookings.length} đơn đặt phòng đã hoàn thành chưa được đánh giá.</p>

            {reviewMsg && (
              <div className={`hd-review-form__msg hd-review-form__msg--${reviewMsg.type}`}>
                <span className="material-symbols-outlined">
                  {reviewMsg.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {reviewMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmitReview}>
              <div className="hd-review-form__field">
                <label>Chọn đơn đặt phòng</label>
                <select
                  value={reviewForm.booking}
                  onChange={e => setReviewForm(f => ({ ...f, booking: e.target.value }))}
                  required
                >
                  <option value="">-- Chọn đơn --</option>
                  {eligibleBookings.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.bookingCode || b._id.slice(-8).toUpperCase()} — {new Date(b.checkInDate).toLocaleDateString('vi-VN')} → {new Date(b.checkOutDate).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hd-review-form__field">
                <label>Đánh giá sao</label>
                <div className="hd-review-form__stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s} type="button"
                      className={`hd-review-form__star ${s <= reviewForm.rating ? 'active' : ''}`}
                      onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                    >
                      <span className="material-symbols-outlined">star</span>
                    </button>
                  ))}
                  <span className="hd-review-form__rating-text">{reviewForm.rating}/5</span>
                </div>
              </div>

              <div className="hd-review-form__field">
                <label>Nhận xét (tuỳ chọn)</label>
                <textarea
                  rows={4}
                  placeholder="Chia sẻ trải nghiệm của bạn tại khách sạn này..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                />
              </div>

              <button type="submit" className="hd-review-form__submit" disabled={isSubmittingReview}>
                {isSubmittingReview ? (
                  <><span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span> Đang gửi...</>
                ) : (
                  <><span className="material-symbols-outlined">send</span> Gửi đánh giá</>
                )}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* ── Modal Slider (Full Screen) ── */}
      {sliderIndex !== null && (
        <div className="hd-slider-overlay">
          <div className="hd-slider-header">
            <button className="hd-slider-back" onClick={() => setSliderIndex(null)}>
              <span className="material-symbols-outlined">arrow_back</span> Thư viện ảnh
            </button>
            <div className="hd-slider-meta">
              <span className="hd-slider-hotel-name">{hotel.name}</span>
              <button className="btn-primary" style={{ padding: '0.4rem 1rem', borderRadius: '4px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setSliderIndex(null); setShowGallery(false); window.scrollTo({ top: 500, behavior: 'smooth' }) }}>Đặt ngay</button>
            </div>
          </div>
          
          <div className="hd-slider-body">
            <button className="hd-slider-nav hd-slider-nav--left" 
                onClick={(e) => { e.stopPropagation(); setSliderIndex((prev) => prev === 0 ? images.length - 1 : prev - 1); }}>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <div className="hd-slider-main-img">
              <img src={images[sliderIndex]} alt={`Slide ${sliderIndex + 1}`} />
            </div>
            
            <button className="hd-slider-nav hd-slider-nav--right" 
                onClick={(e) => { e.stopPropagation(); setSliderIndex((prev) => prev === images.length - 1 ? 0 : prev + 1); }}>
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          
          <div className="hd-slider-footer">
            <div className="hd-slider-counter">{sliderIndex + 1} / {images.length}</div>
            <div className="hd-slider-thumbs">
              {images.map((img, idx) => (
                <div key={idx} 
                     className={`hd-slider-thumb ${idx === sliderIndex ? 'hd-slider-thumb--active' : ''}`}
                     onClick={() => setSliderIndex(idx)}>
                  <img src={img} alt={`Thumb ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Gallery ── */}
      {showGallery && sliderIndex === null && (
        <div className="hd-gallery-modal-overlay" onClick={() => setShowGallery(false)}>
          <div className="hd-gallery-modal" onClick={e => e.stopPropagation()}>
            <div className="hd-gallery-modal__header">
              <h3>Tất cả hình ảnh ({images.length})</h3>
              <button className="hd-gallery-modal__close" onClick={() => setShowGallery(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="hd-gallery-modal__grid">
              {images.map((img, idx) => (
                <div key={idx} className="hd-gallery-modal__item" onClick={() => setSliderIndex(idx)}>
                  <img src={img} alt={`Gallery ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
