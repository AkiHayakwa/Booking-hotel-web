import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import blogApi from '../api/blogApi';
import { useAuth } from '../context/AuthContext';
import './BlogDetailPage.css';

const CATEGORIES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'news', label: 'Tin tức' },
  { value: 'travel_tips', label: 'Cẩm nang' },
  { value: 'hotel_info', label: 'Khách sạn' },
  { value: 'promotion', label: 'Khuyến mãi' },
  { value: 'review', label: 'Đánh giá' }
];

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [popularBlogs, setPopularBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comment form state
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the current blog
        const res = await blogApi.getBySlug(slug);
        if (res.data) {
          setBlog(res.data);
          
          // Fetch comments for this blog
          const commentsRes = await blogApi.getComments(res.data._id);
          if (commentsRes.data) {
            setComments(commentsRes.data);
          }
        } else {
          setError('Không tìm thấy bài viết');
        }

        // Fetch all blogs to get popular ones and tags (for sidebar)
        const allRes = await blogApi.getAll();
        if (allRes.data) {
          const publishedBlogs = allRes.data.filter(b => b.isPublished);
          
          const popular = [...publishedBlogs]
            .sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))
            .filter(b => b.slug !== slug) // exclude current
            .slice(0, 3);
          setPopularBlogs(popular);

          const allTags = [...new Set(publishedBlogs.flatMap(b => b.tags || []))].slice(0, 8);
          setTags(allTags);
        }

      } catch (err) {
        console.error("Error fetching blog details:", err);
        setError('Có lỗi xảy ra khi tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [slug]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vui lòng đăng nhập để bình luận.");
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await blogApi.createComment(blog._id, { content: newComment });
      if (res.data) {
        // Fetch comments again to get full populated user data, or append locally
        const newCommentsRes = await blogApi.getComments(blog._id);
        if (newCommentsRes.data) {
          setComments(newCommentsRes.data);
        }
        setNewComment('');
      }
    } catch (err) {
      console.error("Error creating comment:", err);
      alert("Có lỗi xảy ra khi gửi bình luận.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="bd-loading">
          <span className="material-symbols-outlined">refresh</span>
          <span>Đang tải bài viết...</span>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-detail-page">
        <div className="bd-error">
          <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>error</span>
          <h2>{error || 'Không tìm thấy bài viết'}</h2>
          <Link to="/blog" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Quay lại danh sách blog</Link>
        </div>
      </div>
    );
  }

  const categoryLabel = CATEGORIES.find(c => c.value === blog.category)?.label || blog.category;
  const authorName = blog.author?.fullName || blog.author?.username || 'Admin';

  return (
    <div className="blog-detail-page">
      {/* Container */}
      <div className="blog-detail-layout">
        
        {/* Main Content */}
        <div className="bd-content-wrapper">
          {/* Breadcrumb */}
          <nav className="blog-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="blog-breadcrumb-sep">/</span>
            <Link to="/blog">Blog</Link>
            <span className="blog-breadcrumb-sep">/</span>
            <span className="blog-breadcrumb-active">{blog.title}</span>
          </nav>

          <article className="blog-detail-content">
            {/* Hero Image */}
            <div className="bd-hero">
              <img 
                src={blog.thumbnail || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop'} 
                alt={blog.title} 
                className="bd-hero__img"
              />
              <div className="bd-hero__overlay"></div>
              <div className="bd-hero__info">
                <span className="bd-hero__badge">{categoryLabel}</span>
                <h1 className="bd-hero__title">{blog.title}</h1>
              </div>
            </div>

            {/* Meta Info */}
            <div className="bd-meta">
              <div className="bd-author">
                <div className="bd-author__avatar">
                  {authorName.charAt(0).toUpperCase()}
                </div>
                <div className="bd-author__info">
                  <p>Viết bởi</p>
                  <p>{authorName}</p>
                </div>
              </div>
              <div className="bd-meta-item">
                <span className="material-symbols-outlined">calendar_today</span>
                <span>{new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="bd-meta-item">
                <span className="material-symbols-outlined">chat</span>
                <span>{comments.length} bình luận</span>
              </div>
              
              <div className="bd-share">
                <button className="bd-share__btn" title="Chia sẻ Facebook">
                  <svg className="fill-current" style={{width: '16px', height: '16px'}} viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                </button>
                <button className="bd-share__btn" title="Chia sẻ Twitter">
                  <svg className="fill-current" style={{width: '16px', height: '16px'}} viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>
                </button>
                <button className="bd-share__btn" title="Copy Link">
                  <span className="material-symbols-outlined" style={{fontSize: '18px'}}>link</span>
                </button>
              </div>
            </div>

            {/* Prose Content */}
            <div className="bd-prose">
              {blog.content.split(/(!\[.*?\]\(.*?\))/g).map((part, index) => {
                if (!part) return null;
                const text = part.trim();
                
                // If the part is just whitespace, ignore it
                if (!text) return null;

                // Parse image: ![alt text](url)
                const imgMatch = text.match(/^!\[(.*?)\]\((.*?)\)$/);
                if (imgMatch) {
                  return (
                    <div key={index} className="bd-prose-img-wrapper">
                      <img src={imgMatch[2]} alt={imgMatch[1]} className="bd-prose-img" />
                      {imgMatch[1] && <p className="bd-prose-caption">{imgMatch[1]}</p>}
                    </div>
                  );
                }

                // Parse blockquote: "text"
                if (text.startsWith('"') && text.endsWith('"')) {
                  return <blockquote key={index}>{text.replace(/"/g, '')}</blockquote>;
                }
                
                // Normal text: split text by double newlines for separated paragraphs
                // This ensures paragraph spacing is uniform
                return (
                  <React.Fragment key={index}>
                     {text.split('\n\n').map((subP, subIdx) => {
                       if (!subP.trim()) return null;
                       return <p key={`${index}-${subIdx}`}>{subP.trim()}</p>;
                     })}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Comments */}
            <div className="bd-comments">
              <h3 className="bd-comments__title">Bình luận ({comments.length})</h3>
              
              <form className="bd-comment-form" onSubmit={handleCommentSubmit}>
                <textarea 
                  placeholder={user ? "Nhập bình luận của bạn..." : "Vui lòng đăng nhập để bình luận"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment || !user}
                ></textarea>
                <button 
                  type="submit" 
                  className="bd-comment-submit"
                  disabled={submittingComment || !user}
                >
                  {submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                  <span className="material-symbols-outlined">send</span>
                </button>
              </form>

              <div className="bd-comment-list">
                {comments.map(c => (
                  <div key={c._id} className="bd-comment-item">
                    <div className="bd-comment-item__avatar">
                      {(c.user?.fullName || c.user?.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="bd-comment-item__content">
                      <div className="bd-comment-item__header">
                        <span className="bd-comment-item__name">{c.user?.fullName || c.user?.username}</span>
                        <span className="bd-comment-item__date">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="bd-comment-item__text">{c.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <aside className="bd-sidebar">
          {/* Popular Posts */}
          <div className="bd-sidebar-card">
            <h4 className="bd-sidebar-card__title">Bài viết phổ biến</h4>
            <div className="bd-popular-list">
              {popularBlogs.length > 0 ? popularBlogs.map(p => (
                <Link to={`/blog/${p.slug}`} className="bd-popular-item" key={p._id}>
                  <div className="bd-popular-item__img">
                    <img src={p.thumbnail || 'https://via.placeholder.com/80'} alt={p.title} />
                  </div>
                  <div className="bd-popular-item__info">
                    <h5>{p.title}</h5>
                    <p>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </Link>
              )) : (
                <p style={{fontSize: '0.85rem', color: 'var(--text-light)'}}>Chưa có bài viết khác.</p>
              )}
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="bd-newsletter">
            <span className="material-symbols-outlined">mail</span>
            <h4 className="bd-newsletter__title">Nhận tin mới nhất</h4>
            <p className="bd-newsletter__desc">Đăng ký để nhận các bài viết du lịch hấp dẫn và ưu đãi độc quyền từ LuxStay.</p>
            <input type="email" placeholder="Email của bạn" />
            <button>Đăng ký</button>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bd-sidebar-card">
              <h4 className="bd-sidebar-card__title">Thẻ phổ biến</h4>
              <div className="bd-tags-list">
                {tags.map((tag, idx) => (
                  <Link to={`/blog?tag=${tag}`} key={idx} className="bd-tag">#{tag}</Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Recommended/Related Section could go here if we wanted */}
      {popularBlogs.length > 0 && (
        <section className="bd-related">
          <div className="bd-related__header">
            <h3 className="bd-related__title">Bài viết liên quan</h3>
            <Link to="/blog" className="bd-related__link">
              Xem tất cả <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="bd-related-grid">
            {popularBlogs.map(p => (
              <div key={p._id} className="bd-related-card" onClick={() => navigate(`/blog/${p.slug}`)}>
                <div className="bd-related-card__img-wrapper">
                  <img src={p.thumbnail || 'https://via.placeholder.com/400x300'} alt={p.title} className="bd-related-card__img" />
                  <span className="bd-related-card__badge">
                    {CATEGORIES.find(c => c.value === p.category)?.label || p.category}
                  </span>
                </div>
                <h4 className="bd-related-card__title">{p.title}</h4>
                <p className="bd-related-card__desc">{p.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
