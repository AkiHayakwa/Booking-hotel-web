import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import './BookingDetailPage.css';

const BookingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await bookingApi.getById(id);
                setBooking(res.data);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết đặt phòng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy thông tin đặt phòng</h2>
                <Link to="/my-bookings" className="mt-4 inline-block text-primary font-medium hover:underline">Quay lại danh sách</Link>
            </div>
        );
    }

    const statusInfo = getStatusLabel(booking.status);

    return (
        <main className="max-w-4xl mx-auto px-4 py-12 booking-detail-page">
            <nav className="flex mb-8 text-sm font-medium text-slate-500">
                <Link className="hover:text-primary transition-colors" to="/my-bookings">Đặt chỗ của tôi</Link>
                <span className="mx-2">/</span>
                <span className="text-primary font-bold">Chi tiết #{booking.bookingCode}</span>
            </nav>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Header Section */}
                <div className="bg-primary p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-[100px]">receipt_long</span>
                    </div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <span className={`${statusInfo.class} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20`}>
                                    {statusInfo.label}
                                </span>
                                <h1 className="text-3xl font-black mt-4 tracking-tight">Chi tiết đặt phòng</h1>
                                <p className="text-white/70 mt-1 font-medium">Mã đặt chỗ: <span className="text-white font-bold">{booking.bookingCode}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Tổng thanh toán</p>
                                <p className="text-4xl font-black">{booking.totalPrice.toLocaleString()}đ</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-10">
                    {/* Hotel Info */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Thông tin khách sạn</h3>
                            <div className="flex gap-4">
                                <img 
                                    src={booking.hotel?.images?.[0] || 'https://via.placeholder.com/150'} 
                                    className="w-24 h-24 rounded-2xl object-cover shadow-md"
                                    alt="Hotel"
                                />
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white">{booking.hotel?.name}</h4>
                                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        {booking.hotel?.city}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ngày nhận phòng</h3>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{new Date(booking.checkInDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Ngày trả phòng</h3>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{new Date(booking.checkOutDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </section>

                    {/* Room Details */}
                    <section>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Thông tin phòng & Khách</h3>
                        <div className="space-y-4">
                            {booking.rooms?.map((room, index) => (
                                <div key={index} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">bed</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">Phòng {room.roomNumber}</p>
                                            <p className="text-xs text-slate-500">{room.roomType?.name}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-primary">{room.roomType?.pricePerNight?.toLocaleString()}đ / đêm</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                                <span className="material-symbols-outlined text-sm">group</span>
                                <span className="font-medium">{booking.numberOfGuests} khách người lớn</span>
                            </div>
                        </div>
                    </section>

                    {/* Special Requests */}
                    {booking.specialRequests && (
                        <section className="bg-accent-gold/5 border border-accent-gold/10 p-6 rounded-2xl">
                            <h3 className="text-xs font-black text-accent-gold uppercase tracking-widest mb-3">Yêu cầu đặc biệt</h3>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{booking.specialRequests}</p>
                        </section>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined">download</span>
                            Tải hóa đơn PDF
                        </button>
                        <button onClick={() => navigate('/my-bookings')} className="flex-1 py-4 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            Quay lại danh sách
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default BookingDetailPage;
