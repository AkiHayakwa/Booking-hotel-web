import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, refreshUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        birthday: '',
        gender: 'other',
        address: '',
        avatarUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        if (user) {
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                birthday: user.birthday ? user.birthday.split('T')[0] : '',
                gender: user.gender || 'other',
                address: user.address || '',
                avatarUrl: user.avatarUrl || 'https://i.sstatic.net/l60Hf.png'
            });
            setLoading(false);
        }
    }, [user, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', content: '' });

        try {
            await authApi.updateMe(formData);
            await refreshUser(); // Sync context state
            setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });
        } catch (error) {
            setMessage({ type: 'error', content: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 profile-page">
            {/* Breadcrumb */}
            <nav className="flex mb-8 text-sm font-medium text-slate-500 dark:text-slate-400">
                <a className="hover:text-primary dark:hover:text-white" href="/">Trang chủ</a>
                <span className="mx-2">/</span>
                <span className="text-primary dark:text-white font-bold">Tài khoản của tôi</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-accent-gold overflow-hidden">
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl">person</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{formData.fullName || user.username}</h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-gold/10 text-accent-gold uppercase tracking-wider">
                                        {user.role?.name || 'Thành viên'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <nav className="p-4 space-y-1">
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white transition-colors" to="/profile">
                                <span className="material-symbols-outlined">account_circle</span>
                                <span className="text-sm font-semibold">Tài khoản của tôi</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/my-bookings">
                                <span className="material-symbols-outlined">calendar_today</span>
                                <span className="text-sm font-medium">Đặt chỗ của tôi</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" to="/settings">
                                <span className="material-symbols-outlined">settings</span>
                                <span className="text-sm font-medium">Cài đặt</span>
                            </Link>
                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                    <span className="material-symbols-outlined">logout</span>
                                    <span className="text-sm font-medium">Đăng xuất</span>
                                </button>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Profile Header Card */}
                        <div className="h-32 bg-primary relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-900"></div>
                        </div>

                        <div className="px-8 pb-8">
                            <div className="relative flex flex-col md:flex-row justify-between items-center md:items-end -mt-12 md:-mt-16 mb-6 gap-4 md:gap-0">
                                <div className="relative shrink-0">
                                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 shadow-lg overflow-hidden">
                                        <img alt="Profile picture" className="h-full w-full object-cover" src={formData.avatarUrl} />
                                    </div>
                                    <button type="button" className="absolute bottom-1 right-1 p-1.5 bg-accent-gold text-white rounded-full shadow-md border-2 border-white dark:border-slate-900 hover:bg-accent-gold/90 transition-transform active:scale-95">
                                        <span className="material-symbols-outlined text-sm md:text-base">photo_camera</span>
                                    </button>
                                </div>
                                <div className="flex-1 text-center md:text-left md:ml-6 pb-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">{formData.fullName || user.username}</h1>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium">
                                        Thành viên từ {new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })} • <span className="text-accent-gold uppercase tracking-wider">{user.role?.name || 'Customer'}</span>
                                    </p>
                                </div>
                                <div className="pb-2">
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        {saving && <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>}
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>

                            {message.content && (
                                <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.content}
                                </div>
                            )}

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-6">
                                    <h4 className="text-lg font-bold text-primary dark:text-accent-gold">Thông tin cá nhân</h4>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Họ và tên</label>
                                        <input 
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                                            type="text" 
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Địa chỉ Email</label>
                                        <div className="relative">
                                            <input 
                                                value={formData.email}
                                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                                                readOnly 
                                                type="email" 
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">
                                                <span className="material-symbols-outlined text-sm">verified</span> Đã xác thực
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Số điện thoại</label>
                                        <input 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                                            type="tel" 
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-lg font-bold text-primary dark:text-accent-gold">Thông tin thêm</h4>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ngày sinh</label>
                                        <input 
                                            name="birthday"
                                            value={formData.birthday}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                                            type="date" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Giới tính</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['male', 'female', 'other'].map((gender) => (
                                                <label key={gender} className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-all ${formData.gender === gender ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                    <input 
                                                        type="radio" 
                                                        name="gender" 
                                                        value={gender} 
                                                        checked={formData.gender === gender}
                                                        onChange={handleChange}
                                                        className="hidden"
                                                    />
                                                    <span className="text-sm font-medium capitalize">{gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Địa chỉ hiện tại</label>
                                        <textarea 
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                                            rows="3"
                                            placeholder="Nhập địa chỉ của bạn"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Loyalty Program Preview */}
                    <div className="bg-gradient-to-r from-primary to-slate-900 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-lg">
                        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                            <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
                        </div>
                        <div className="relative z-10 w-full">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                LuxStay Rewards <span className="material-symbols-outlined text-accent-gold">stars</span>
                            </h3>
                            <p className="text-slate-300 max-w-md">Bạn đang là thành viên của LuxStay. Tích lũy thêm điểm đặt phòng để nhận thêm nhiều ưu đãi đặc biệt.</p>
                            <div className="mt-6 w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-accent-gold h-full rounded-full" style={{ width: '30%' }}></div>
                            </div>
                            <div className="flex justify-between mt-3 text-xs font-bold uppercase tracking-wider">
                                <span className="text-accent-gold">Thành viên mới</span>
                                <span>300 / 1.000 điểm</span>
                                <span className="text-slate-400">Thành viên Bạc</span>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-accent-gold text-primary font-bold rounded-lg shadow-lg hover:bg-accent-gold/90 transition-all whitespace-nowrap z-10 hover:scale-105 active:scale-95">
                            Xem ưu đãi của tôi
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;
