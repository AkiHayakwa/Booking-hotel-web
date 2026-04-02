import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookingApi from '../api/bookingApi';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
            return;
        }

        const fetchBookings = async () => {
            if (!user) return;
            try {
                const res = await bookingApi.getMyBookings();
                setBookings(res.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đặt chỗ:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user, authLoading, navigate]);

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return { label: 'Đang xử lý', class: 'bg-blue-100 text-blue-700' };
            case 'confirmed': return { label: 'Đã xác nhận', class: 'bg-green-100 text-green-700' };
            case 'checked_in': return { label: 'Đã nhận phòng', class: 'bg-indigo-100 text-indigo-700' };
            case 'checked_out': return { label: 'Đã trả phòng', class: 'bg-slate-100 text-slate-700' };
            case 'cancelled': return { label: 'Đã hủy', class: 'bg-red-100 text-red-700' };
            default: return { label: status, class: 'bg-gray-100 text-gray-700' };
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này?")) {
            try {
                await bookingApi.cancel(id);
                const res = await bookingApi.getMyBookings();
                setBookings(res.data);
            } catch (error) {
                alert(error.response?.data?.message || "Không thể hủy đơn đặt phòng.");
            }
        }
    };

    const filterBookings = () => {
        if (activeTab === 'upcoming') {
            return bookings.filter(b => ['pending', 'confirmed', 'checked_in'].includes(b.status));
        } else if (activeTab === 'completed') {
            return bookings.filter(b => b.status === 'checked_out');
        } else if (activeTab === 'cancelled') {
            return bookings.filter(b => b.status === 'cancelled');
        }
        return bookings;
    };

    const filteredBookings = filterBookings();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <main className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8 flex flex-col md:flex-row gap-8 my-bookings-page">
            {/* Sidebar */}
            <aside className="w-full md:w-64 shrink-0">
                <nav className="flex flex-col gap-1 sticky top-24">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all group">
                        <span className="material-symbols-outlined group-hover:text-primary">person</span>
                        <span className="text-sm font-medium">Tài khoản của tôi</span>
                    </Link>
                    <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 transition-all">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                        <span className="text-sm font-medium">Đặt chỗ của tôi</span>
                    </Link>
                    <a className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all group" href="#">
                        <span className="material-symbols-outlined group-hover:text-primary">favorite</span>
                        <span className="text-sm font-medium">Danh sách yêu thích</span>
                    </a>
                    <Link className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all group" to="/settings">
                        <span className="material-symbols-outlined group-hover:text-primary">settings</span>
                        <span className="text-sm font-medium">Cài đặt</span>
                    </Link>
                    <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <p className="text-xs font-bold text-primary uppercase mb-2">Hỗ trợ 24/7</p>
                        <p className="text-sm text-slate-600 mb-4">Bạn cần trợ giúp về việc đặt phòng?</p>
                        <button className="w-full py-2 bg-white text-primary text-xs font-bold rounded-lg border border-primary/10 hover:bg-primary hover:text-white transition-colors">
                            Liên hệ ngay
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-primary dark:text-slate-100 tracking-tight">Đặt chỗ của tôi</h1>
                    <p className="text-slate-500 mt-2">Xem và quản lý tất cả các chuyến đi của bạn tại một nơi.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-primary/10 mb-8 overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}
                    >
                        Sắp tới ({bookings.filter(b => ['pending', 'confirmed', 'checked_in'].includes(b.status)).length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'completed' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}
                    >
                        Đã hoàn thành ({bookings.filter(b => b.status === 'checked_out').length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('cancelled')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'cancelled' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}
                    >
                        Đã hủy ({bookings.filter(b => b.status === 'cancelled').length})
                    </button>
                </div>

                {/* Booking Cards List */}
                <div className="flex flex-col gap-6">
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => {
                            const statusInfo = getStatusLabel(booking.status);
                            const hotelImage = booking.hotel?.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image';
                            
                            return (
                                <div key={booking._id} className="group flex flex-col lg:flex-row bg-white dark:bg-slate-800 rounded-2xl border border-primary/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                                    <div className="lg:w-72 h-48 lg:h-auto overflow-hidden">
                                        <div 
                                            className="h-full w-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500" 
                                            style={{ backgroundImage: `url('${hotelImage}')` }}
                                        ></div>
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`${statusInfo.class} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                                                        {statusInfo.label}
                                                    </span>
                                                    <span className="text-slate-400 text-xs flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-xs">location_on</span> {booking.hotel?.city || 'Việt Nam'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-primary dark:text-slate-100">{booking.hotel?.name || 'Hotel Name'}</h3>
                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                        <span>{new Date(booking.checkInDate).toLocaleDateString('vi-VN')} - {new Date(booking.checkOutDate).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-sm">group</span>
                                                        <span>{booking.numberOfGuests} người</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="sm:text-right">
                                                <p className="text-xs text-slate-400 font-medium">Tổng thanh toán</p>
                                                <p className="text-xl font-black text-primary">{booking.totalPrice.toLocaleString()}đ</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                            <div className="flex -space-x-2">
                                                <span className="text-xs text-slate-400 font-medium">Mã đặt chỗ: <span className="text-slate-900 dark:text-slate-100">{booking.bookingCode}</span></span>
                                            </div>
                                            <div className="flex gap-2">
                                                {booking.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleCancel(booking._id)}
                                                        className="px-4 py-2 bg-red-100 text-red-600 text-xs font-bold rounded-xl hover:bg-red-600 hover:text-white transition-colors"
                                                    >
                                                        Hủy
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => navigate(`/my-bookings/${booking._id}`)}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                                                >
                                                    Xem chi tiết
                                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">calendar_today</span>
                            <p className="text-slate-500 font-medium">Bạn chưa có đơn đặt phòng nào trong mục này.</p>
                            <Link to="/hotels" className="inline-block mt-6 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg">Khám phá ngay</Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default MyBookingsPage;
