import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import './PaymentResultPage.css';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const resultCode = searchParams.get('resultCode');
  const message = searchParams.get('message');
  const extraData = searchParams.get('extraData'); // extraData là bookingId do chúng ta truyền qua
  const orderId = searchParams.get('orderId');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // resultCode = 0 means success in MoMo API
    if (resultCode === '0' && extraData) {
      // Gọi API lấy thông tin booking để hiển thị thêm
      const fetchBooking = async () => {
        try {
          const res = await bookingApi.getById(extraData);
          if (res.data) setBooking(res.data);
        } catch (err) {
          console.error("Lỗi khi tải thông tin booking", err);
        } finally {
          setLoading(false);
        }
      };
      
      // Delay khoảng 2s để chờ Webhook IPN xử lý bên backend trước khi load trạng thái
      setTimeout(() => {
        fetchBooking();
      }, 2000);
    } else {
      setLoading(false);
    }
  }, [resultCode, extraData]);

  const isSuccess = resultCode === '0';

  return (
    <div className="payment-result-page">
      <div className={`payment-result-card ${isSuccess ? 'success' : 'error'}`}>
        <div className="payment-result-icon">
          <span className="material-symbols-outlined">
            {isSuccess ? 'check_circle' : 'cancel'}
          </span>
        </div>
        
        <h2 className="payment-result-title">
          {isSuccess ? 'Thanh toán Thành công!' : 'Thanh toán Thất bại / Hủy bỏ'}
        </h2>
        <p className="payment-result-message">
          {message || 'Xin vui lòng kiểm tra lại trạng thái giao dịch.'}
        </p>

        <div className="payment-result-details">
          <div className="pr-detail-row">
            <span>Mã giao dịch MoMo:</span>
            <strong>{orderId || '---'}</strong>
          </div>
          <div className="pr-detail-row">
            <span>Mã hóa đơn hệ thống:</span>
            <strong>{extraData || '---'}</strong>
          </div>
          
          {loading ? (
            <div className="pr-detail-loading">Đang cập nhật thông tin đơn hàng...</div>
          ) : isSuccess && booking ? (
            <div className="pr-booking-summary">
              <hr />
              <div className="pr-detail-row">
                <span>Khách sạn:</span>
                <strong>{booking.hotel?.name || '---'}</strong>
              </div>
              <div className="pr-detail-row">
                <span>Tổng số phòng:</span>
                <strong>{booking.rooms?.length || 0} phòng</strong>
              </div>
              <div className="pr-detail-row">
                <span>Trạng thái Code:</span>
                <strong style={{ color: '#22c55e' }}>{booking.status.toUpperCase()}</strong>
              </div>
              <div className="pr-detail-row">
                <span>Tổng tiền:</span>
                <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>
                  {booking.totalPrice?.toLocaleString('vi-VN')}đ
                </strong>
              </div>
            </div>
          ) : null}
        </div>

        <div className="payment-result-actions">
          {isSuccess ? (
            <button className="pr-btn pr-btn--primary" onClick={() => navigate('/my-bookings')}>
              Xem Đơn Phòng Của Tôi
            </button>
          ) : (
            <button className="pr-btn pr-btn--retry" onClick={() => navigate(-1)}>
              Thử Thanh Toán Lại
            </button>
          )}
          <Link to="/" className="pr-btn pr-btn--secondary">Về Trang Chủ</Link>
        </div>
      </div>
    </div>
  );
}
