import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import userApi from '../api/userApi';
import authApi from '../api/authApi';
import statsApi from '../api/statsApi';
import './AdminUsersPage.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0, active: 0, suspended: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleName: 'customer'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        userApi.getAll(),
        statsApi.getAdminOverview()
      ]);
      
      if (usersRes.data) setUsers(usersRes.data);
      if (statsRes.data) {
        setStats({
          total: statsRes.data.totalUsers,
          active: statsRes.data.activeUsers,
          suspended: statsRes.data.suspendedUsers
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const SUMMARY_STATS = [
    { icon: 'group',      label: 'Total Users',     value: stats.total.toLocaleString() },
    { icon: 'how_to_reg', label: 'Active Users',      value: stats.active.toLocaleString() },
    { icon: 'person_off', label: 'Suspended Accounts', value: stats.suspended.toLocaleString() },
    { icon: 'person_add', label: 'New Sign-ups (30d)', value: 'Recently' },
  ];

  const handleToggleStatus = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?')) {
      try {
        await userApi.toggleStatus(id);
        fetchData();
      } catch (error) {
        alert('Lỗi khi cập nhật trạng thái');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này? (Hành động này không thể hoàn tác)')) {
      try {
        await userApi.delete(id);
        fetchData();
      } catch (error) {
        alert('Lỗi khi xóa người dùng');
      }
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({ _id: '', username: '', fullName: '', email: '', phone: '', password: '', roleName: 'customer' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setIsEdit(true);
    setFormData({
      _id: user._id,
      username: user.username || '',
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '', // Leave blank for edit unless changing
      roleName: user.role?.name || 'customer'
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (isEdit) {
        // Chỉ gửi những trường cần cập nhật
        const updateData = {
          fullName: formData.fullName,
          phone: formData.phone,
          roleName: formData.roleName
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        // Cập nhật thông tin cơ bản
        await userApi.update(formData._id, updateData);
        // Nếu API backend chưa hỗ trợ cập nhật thẳng role từ update_user, ta gọi đổi role
        // Thực tế backend `UpdateUser` trong code của bạn đã xử lý req.body. Nhưng cứ gọi chắc chắn
        alert('Cập nhật người dùng thành công!');
      } else {
        await authApi.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          roleName: formData.roleName
        });
        alert('Thêm người dùng thành công!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Lỗi khi lưu người dùng: ' + (error.response?.data?.message || error.response?.data || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredUsers = (users || []).filter(u => {
    const name = (u.fullName || u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const currentData = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
    <AdminLayout 
      activePath="/admin/users" 
      searchPlaceholder="Search users by name or email..."
      onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
    >
      {/* ── Page Header ── */}
      <div className="admin-page-header admin-page-header--row">
        <div>
          <h2 className="admin-page-header__title">User Management</h2>
          <p className="admin-page-header__sub">Oversee platform accounts and roles</p>
        </div>
        <button className="usr-add-btn" onClick={openAddModal}>
          <span className="material-symbols-outlined">person_add</span>
          Add New User
        </button>
      </div>

      {/* ── Summary Stats ── */}
      <div className="admin-stats-grid">
        {SUMMARY_STATS.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-card__top">
              <div className="admin-stat-card__icon admin-stat-card__icon--primary">
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
            </div>
            <p className="admin-stat-card__label">{s.label}</p>
            <p className="admin-stat-card__value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main Table Card ── */}
      <div className="admin-table-card">
        <div className="admin-table-card__header">
          <h3 className="admin-table-card__title">All Users ({filteredUsers.length})</h3>
          <div className="admin-table-card__actions">
            <button className="usr-filter-btn">
              <span className="material-symbols-outlined">filter_list</span> Filter
            </button>
            <button className="usr-filter-btn">
              <span className="material-symbols-outlined">download</span> Export
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center">Đang tải dữ liệu...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan="5" className="text-center">Không có dữ liệu</td></tr>
              ) : currentData.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="usr-details">
                      <div className="usr-avatar">
                        <img src={u.avatarUrl || 'https://i.sstatic.net/l60Hf.png'} alt={u.username} />
                      </div>
                      <div className="usr-info">
                        <p className="usr-name">{u.fullName || u.username}</p>
                        <p className="usr-email">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`usr-role usr-role--${u.role?.name || 'user'}`}>
                      {u.role?.name || 'User'}
                    </span>
                  </td>
                  <td>
                    <p className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td>
                    <div className={`admin-status admin-status--${u.status ? 'active' : 'suspended'}`}>
                      <span className="admin-status__dot" />
                      {u.status ? 'Active' : 'Suspended'}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="admin-action-group justify-end">
                      <button 
                        className="admin-action-btn" 
                        title="Toggle Status"
                        onClick={() => handleToggleStatus(u._id)}
                      >
                        <span className="material-symbols-outlined">{u.status ? 'person_off' : 'how_to_reg'}</span>
                      </button>
                      <button 
                        className="admin-action-btn" 
                        title="Edit Profile"
                        onClick={() => openEditModal(u)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        className="admin-action-btn admin-action-btn--delete" 
                        title="Delete User"
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="admin-pagination">
          <p className="admin-pagination__info">
            Showing <strong>{filteredUsers.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</strong> to <strong>{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> results
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

      {/* ── Modal Thêm/Sửa Người Dùng ── */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <button className="admin-modal-close" onClick={() => setShowModal(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{isEdit ? 'Edit User' : 'Add New User'}</h3>
              <p className="admin-modal-sub">
                {isEdit ? 'Update user details and roles.' : 'Create a new account manually.'}
              </p>
            </div>
            
            <form onSubmit={handleSaveUser}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Username {!isEdit && '*'}</label>
                  <input 
                    type="text" name="username" className="admin-form-input" 
                    value={formData.username} onChange={handleChange} 
                    required={!isEdit} disabled={isEdit} 
                    placeholder="e.g. johndoe"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Email {!isEdit && '*'}</label>
                  <input 
                    type="email" name="email" className="admin-form-input" 
                    value={formData.email} onChange={handleChange} 
                    required={!isEdit} disabled={isEdit} 
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Full Name *</label>
                <input 
                  type="text" name="fullName" className="admin-form-input" 
                  value={formData.fullName} onChange={handleChange} 
                  required placeholder="John Doe"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Phone</label>
                  <input 
                    type="text" name="phone" className="admin-form-input" 
                    value={formData.phone} onChange={handleChange} 
                    placeholder="0901234567"
                    pattern="^\d{10,11}$"
                    title="Số điện thoại phải bao gồm 10-11 chữ số"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Role</label>
                  <select 
                    name="roleName" className="admin-form-select" 
                    value={formData.roleName} onChange={handleChange}
                  >
                    <option value="customer">Customer</option>
                    <option value="hotel_owner">Hotel Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Password {!isEdit && '*'}</label>
                <input 
                  type="password" name="password" className="admin-form-input" 
                  value={formData.password} onChange={handleChange} 
                  required={!isEdit} 
                  minLength={6}
                  placeholder={isEdit ? "Để trống nếu không muốn đổi mật khẩu" : "Nhập mật khẩu (tối thiểu 6 ký tự)"}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-submit" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
