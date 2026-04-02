import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';
import './SettingsPage.css';

const SettingsPage = () => {
    const { user, refreshUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('notifications');
    const [notifications, setNotifications] = useState({
        promotions: true,
        bookingConfirmations: true,
        scheduleReminders: true,
        messages: true
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (user && user.notificationSettings) {
            setNotifications(user.notificationSettings);
        }
    }, [user, authLoading, navigate]);

    const handleToggle = (key) => {
        if (key === 'bookingConfirmations') return; // Mandatory
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveNotifications = async () => {
        setSaving(true);
        setMessage({ type: '', content: '' });
        try {
            await authApi.updateMe({ notificationSettings: notifications });
            await refreshUser();
            setMessage({ type: 'success', content: 'Cập nhật cài đặt thành công!' });
        } catch (error) {
            setMessage({ type: 'error', content: error.response?.data?.message || 'Lỗi khi cập nhật cài đặt' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', content: 'Mật khẩu mới và xác nhận mật khẩu không khớp' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', content: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', content: '' });
        try {
            await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
            setMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', content: error.response?.data || 'Mật khẩu hiện tại không chính xác' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.");
        if (!confirmDelete) return;

        setSaving(true);
        try {
            await authApi.deleteMe();
            // Xóa xong thì tự động đăng xuất và về trang chủ
            window.location.href = '/';
        } catch (error) {
            setMessage({ type: 'error', content: error.response?.data?.message || 'Lỗi khi xóa tài khoản' });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const renderSecurityTab = () => (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/10 overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-2xl font-bold text-primary dark:text-white">Bảo mật & Mật khẩu</h1>
                <p className="text-slate-500 mt-1 text-sm">Bảo vệ tài khoản của bạn với các tùy chọn bảo mật nâng cao.</p>
            </div>
            <div className="p-6 lg:p-8 space-y-10">
                {message.content && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.content}
                    </div>
                )}

                {/* Change Password Section */}
                <form onSubmit={handleChangePassword}>
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span className="material-symbols-outlined text-accent">lock_reset</span>
                        Đổi mật khẩu
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mật khẩu hiện tại</label>
                            <input 
                                type="password" 
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mật khẩu mới</label>
                            <input 
                                type="password" 
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Xác nhận mật khẩu mới</label>
                            <input 
                                type="password" 
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button 
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm flex items-center gap-2"
                        >
                            {saving && <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>}
                            Cập nhật mật khẩu
                        </button>
                    </div>
                </form>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                        <div>
                            <h4 className="font-black text-red-600 uppercase tracking-widest text-xs mb-1">Khu vực nguy hiểm</h4>
                            <p className="font-bold text-slate-900 dark:text-white">Xóa tài khoản vĩnh viễn</p>
                            <p className="text-xs text-slate-500 mt-1">Một khi đã xóa, bạn sẽ không thể khôi phục lại dữ liệu này.</p>
                        </div>
                        <button 
                            onClick={handleDeleteAccount}
                            disabled={saving}
                            className="px-6 py-2.5 bg-white dark:bg-slate-800 text-red-600 font-bold text-sm border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                            Xóa tài khoản
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/10 overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-2xl font-bold text-primary dark:text-white">Cài đặt thông báo</h1>
                <p className="text-slate-500 mt-1 text-sm">Quản lý cách chúng tôi liên hệ với bạn và những thông tin bạn muốn nhận.</p>
            </div>
            <div className="p-6 lg:p-8 space-y-8">
                {message.content && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.content}
                    </div>
                )}

                {/* Notification Group 1 */}
                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span className="material-symbols-outlined text-accent">mail</span>
                        Thông báo qua Email
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div>
                                <p className="font-semibold text-sm">Khuyến mãi & Ưu đãi</p>
                                <p className="text-xs text-slate-500">Nhận thông báo về các mã giảm giá và chương trình ưu đãi mới nhất.</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer" onClick={() => handleToggle('promotions')}>
                                <input checked={notifications.promotions} readOnly className="sr-only peer" type="checkbox" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div>
                                <p className="font-semibold text-sm">Xác nhận đặt phòng</p>
                                <p className="text-xs text-slate-500">Gửi thông tin xác nhận và biên lai thanh toán ngay khi hoàn tất.</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer opacity-50 cursor-not-allowed">
                                <input checked={true} disabled className="sr-only peer" type="checkbox" />
                                <div className="w-11 h-6 bg-accent rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[23px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Group 2 */}
                <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <span className="material-symbols-outlined text-accent">smartphone</span>
                        Thông báo ứng dụng (Push)
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div>
                                <p className="font-semibold text-sm">Nhắc nhở lịch trình</p>
                                <p className="text-xs text-slate-500">Thông báo nhắc nhở ngày nhận phòng và trả phòng.</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer" onClick={() => handleToggle('scheduleReminders')}>
                                <input checked={notifications.scheduleReminders} readOnly className="sr-only peer" type="checkbox" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div>
                                <p className="font-semibold text-sm">Tin nhắn từ chủ chỗ nghỉ</p>
                                <p className="text-xs text-slate-500">Nhận thông báo khi có tin nhắn trao đổi mới.</p>
                            </div>
                            <div className="relative inline-flex items-center cursor-pointer" onClick={() => handleToggle('messages')}>
                                <input checked={notifications.messages} readOnly className="sr-only peer" type="checkbox" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                    <Link to="/profile" className="px-6 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm">Hủy</Link>
                    <button 
                        onClick={handleSaveNotifications}
                        disabled={saving}
                        className="px-8 py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm flex items-center gap-2"
                    >
                        {saving && <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>}
                        Cập nhật cài đặt
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-10 gap-8 settings-page">
            {/* Settings Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-sm border border-primary/10 sticky top-28">
                    <div className="p-4 mb-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Cài đặt</h3>
                    </div>
                    <nav className="flex flex-col gap-1">
                        <button 
                            onClick={() => { setActiveTab('notifications'); setMessage({type: '', content: ''}); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'notifications' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'notifications' ? "'FILL' 1" : "'FILL' 0" }}>notifications_active</span>
                            <span className="text-sm">Cài đặt thông báo</span>
                        </button>
                        <button 
                            onClick={() => { setActiveTab('security'); setMessage({type: '', content: ''}); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'security' ? "'FILL' 1" : "'FILL' 0" }}>security</span>
                            <span className="text-sm">Bảo mật & Mật khẩu</span>
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Settings Content Area */}
            <section className="flex-1">
                {activeTab === 'notifications' ? renderNotificationsTab() : renderSecurityTab()}
            </section>
        </main>
    );
};

export default SettingsPage;
