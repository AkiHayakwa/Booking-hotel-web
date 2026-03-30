export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__about">
          <div className="footer__brand">
            <div className="footer__logo">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"></path>
              </svg>
            </div>
            <h2>LuxStay Booking</h2>
          </div>
          <p>Nền tảng đặt phòng trực tuyến hàng đầu, mang đến cho bạn những trải nghiệm lưu trú tuyệt vời nhất tại Việt Nam.</p>
          <div className="footer__socials">
            <a href="#"><span className="material-symbols-outlined">public</span></a>
            <a href="#"><span className="material-symbols-outlined">share</span></a>
            <a href="#"><span className="material-symbols-outlined">movie</span></a>
          </div>
        </div>

        <div className="footer__section">
          <h3>Liên kết nhanh</h3>
          <ul>
            <li><a href="#">Về chúng tôi</a></li>
            <li><a href="#">Dịch vụ</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        <div className="footer__section">
          <h3>Hỗ trợ khách hàng</h3>
          <ul>
            <li><a href="#">Trung tâm trợ giúp</a></li>
            <li><a href="#">Quy trình đặt phòng</a></li>
            <li><a href="#">Chính sách hoàn tiền</a></li>
            <li><a href="#">Liên hệ hỗ trợ</a></li>
          </ul>
        </div>

        <div className="footer__section">
          <h3>Thông tin liên hệ</h3>
          <div className="footer__contact">
            <div className="footer__contact-item">
              <span className="material-symbols-outlined">location_on</span>
              <span>Quận 1, TP. Hồ Chí Minh, Việt Nam</span>
            </div>
            <div className="footer__contact-item">
              <span className="material-symbols-outlined">phone</span>
              <span>+84 123 456 789</span>
            </div>
            <div className="footer__contact-item">
              <span className="material-symbols-outlined">mail</span>
              <span>contact@luxstaybooking.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        © 2024 LuxStay Booking. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
}
