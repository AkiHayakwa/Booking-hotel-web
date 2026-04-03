import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import reviewApi from '../api/reviewApi';
import './AdminReviewsPage.css';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getAllAdmin();
      setReviews(res.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id, hotelName) => {
    if (window.confirm(`Bạn có chắc muốn xóa đánh giá về khách sạn "${hotelName}" không?\nHành động này không thể hoàn tác.`)) {
      try {
        await reviewApi.deleteAdmin(id);
        // Cập nhật lại danh sách trên UI
        setReviews(prev => prev.filter(r => r._id !== id));
      } catch (error) {
        alert("Lỗi khi xóa đánh giá. Vui lòng thử lại sau.");
      }
    }
  };

  // Helper để vẽ sao
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className="material-symbols-outlined" 
          style={{ color: i <= Math.round(rating) ? '#f59e0b' : '#e2e8f0', fontSize: '1.1rem' }}
        >
          star
        </span>
      );
    }
    return <div style={{ display: 'flex', alignItems: 'center' }}>{stars}</div>;
  };

  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE) || 1;
  const currentData = reviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPaginationArray = () => {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }
    return pages;
  };

  return (
    <AdminLayout activePath="/admin/reviews" searchPlaceholder="Tìm kiếm đánh giá (chưa hỗ trợ)...">
      <div className="admin-reviews">
        <div className="admin-reviews__header">
          <div>
            <h2 className="admin-reviews__title">Quản lý Đánh giá</h2>
            <p className="admin-reviews__subtitle">Kiểm duyệt các phản hồi từ khách hàng cho hệ thống khách sạn</p>
          </div>
          <div className="admin-reviews__stats-badge">
            <span className="material-symbols-outlined">forum</span>
            <span>Tổng cộng: <b>{reviews.length}</b> đánh giá</span>
          </div>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Khách sạn</th>
                  <th>Mức đánh giá</th>
                  <th style={{width: '35%'}}>Nội dung</th>
                  <th>Ngày đăng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-8">Đang tải dữ liệu...</td></tr>
                ) : currentData.length > 0 ? (
                  currentData.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div className="review-user-info">
                          <img 
                            src={r.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user?.fullName || 'User')}&background=f8fafc&color=334155`} 
                            alt="avatar" 
                            className="review-user-avatar"
                          />
                          <div className="review-user-text">
                            <span className="review-user-name">{r.user?.fullName || 'Khách viếng thăm'}</span>
                            {r.user?.username && <span className="review-user-handle">@{r.user.username}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="review-hotel-info">
                          <span className="review-hotel-name">{r.hotel?.name || '---'}</span>
                          <span className="review-hotel-city">{r.hotel?.city || ''}</span>
                        </div>
                      </td>
                      <td>
                        <div className="review-rating-col">
                          {renderStars(r.rating)}
                          <span className="review-rating-num">{r.rating}/5</span>
                        </div>
                      </td>
                      <td>
                        <p className="review-comment-text">
                          {r.comment ? (
                            <span style={{ fontStyle: 'italic' }}>"{r.comment}"</span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Không có nội dung</span>
                          )}
                        </p>
                      </td>
                      <td>
                        <span className="review-date-badge">
                          {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button 
                            className="admin-table-btn admin-table-btn--danger" 
                            title="Xóa đánh giá vĩnh viễn" 
                            onClick={() => handleDelete(r._id, r.hotel?.name || 'Khách sạn')}
                          >
                            <span className="material-symbols-outlined">delete_forever</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-8">Hệ thống chưa có đánh giá nào.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="admin-pagination" style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <p className="admin-pagination__info">
              Showing <strong>{reviews.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, reviews.length)}</strong> of <strong>{reviews.length}</strong> results
            </p>
            {totalPages > 1 && (
              <div className="admin-pagination__controls">
                <button 
                  type="button"
                  className="admin-pagination__btn" 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                {getPaginationArray().map((item, idx) => (
                  item === '...' ? (
                    <span key={`sep-${idx}`} className="admin-pagination__sep">...</span>
                  ) : (
                    <button 
                      type="button"
                      key={item}
                      className={`admin-pagination__btn ${currentPage === item ? 'active' : ''}`}
                      onClick={() => handlePageChange(item)}
                    >
                      {item}
                    </button>
                  )
                ))}
                
                <button 
                  type="button"
                  className="admin-pagination__btn" 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
