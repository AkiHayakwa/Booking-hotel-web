import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    setShowDropdown(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-primary dark:text-accent">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary dark:text-slate-100">LuxStay Booking</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-medium hover:text-accent transition-colors" to="/">Trang chủ</Link>
          <Link className="text-sm font-medium hover:text-accent transition-colors" to="/hotels">Khách sạn</Link>
          <Link className="text-sm font-medium hover:text-accent transition-colors" to="/promotions">Ưu đãi</Link>
          <Link className="text-sm font-medium hover:text-accent transition-colors" to="/blog">Blog</Link>
          <a className="text-sm font-medium hover:text-accent transition-colors" href="#">Liên hệ</a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img 
                    alt={user.fullName || user.username || "User"} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.fullName || user.username || "User"}&background=c5a059&color=fff`}
                  />
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-primary dark:text-slate-100 leading-tight">
                      {user.fullName || user.username || "Nguyễn An"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{user.role === 'admin' ? 'Quản trị viên' : 'Thành viên Vàng'}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary dark:group-hover:text-accent transition-colors text-lg">
                    expand_more
                  </span>
                </div>

                {/* User Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-[60]">
                    {/* User Summary Section */}
                    <div className="p-5 bg-gradient-to-br from-primary/5 to-transparent dark:from-white/5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <div 
                          className="size-14 rounded-full bg-cover bg-center ring-2 ring-accent ring-offset-2 dark:ring-offset-slate-900" 
                          style={{ backgroundImage: `url('${user.avatar || `https://ui-avatars.com/api/?name=${user.fullName || user.username || "User"}&background=c5a059&color=fff`}')` }}
                        ></div>
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-primary dark:text-white">
                            {user.fullName || user.username || "Nguyễn An"}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="material-symbols-outlined text-accent text-base" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                            <span className="text-xs font-bold text-accent tracking-wider uppercase">Thành viên Gold</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Primary Quick-access Items */}
                    <div className="py-2">
                      <a className="flex items-center gap-3 px-5 py-3 text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors group" href="#">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary dark:group-hover:text-accent">person_outline</span>
                        <span className="text-sm font-medium">Thông tin cá nhân</span>
                      </a>
                      <a className="flex items-center gap-3 px-5 py-3 text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors group" href="#">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary dark:group-hover:text-accent">calendar_month</span>
                        <span className="text-sm font-medium">Đặt chỗ của tôi</span>
                      </a>
                      <a className="flex items-center gap-3 px-5 py-3 text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors group" href="#">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary dark:group-hover:text-accent">favorite_border</span>
                        <span className="text-sm font-medium">Danh sách yêu thích</span>
                      </a>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-5"></div>
                      
                      {/* Separate Settings Section */}
                      <a className="flex items-center gap-3 px-5 py-3 text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors group" href="#">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary dark:group-hover:text-accent">settings</span>
                        <span className="text-sm font-medium">Cài đặt</span>
                      </a>
                      <a className="flex items-center gap-3 px-5 py-3 text-slate-700 dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors group" href="#">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary dark:group-hover:text-accent">help_outline</span>
                        <span className="text-sm font-medium">Trợ giúp</span>
                      </a>
                    </div>
                    
                    {/* Logout Section */}
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <a 
                        className="flex items-center gap-3 px-5 py-4 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors cursor-pointer" 
                        onClick={handleLogout}
                      >
                        <span className="material-symbols-outlined text-rose-500">logout</span>
                        <span className="text-sm font-bold">Đăng xuất</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-primary dark:text-slate-300 dark:hover:text-accent px-4 py-2 transition-colors">Đăng nhập</Link>
              <Link to="/register" className="text-sm font-bold bg-primary text-white hover:bg-opacity-90 dark:bg-accent dark:hover:brightness-110 px-5 py-2 rounded shadow-md transition-all">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
