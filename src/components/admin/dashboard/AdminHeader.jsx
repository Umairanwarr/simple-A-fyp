import React from 'react';

export default function AdminHeader({ onMenuClick }) {
  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 font-sans sticky top-0 z-30">
      
      {/* Left side: Hamburger (mobile only) & Search */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="hidden md:flex relative w-[320px]">
          <svg 
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search users, clinics, settings..." 
            className="w-full bg-[#F5F5F5E5] text-[#4B5563] text-[14px] font-medium py-2.5 pl-10 pr-4 rounded-full outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 border border-transparent focus:border-[#1EBDB8] transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right side: Notifications & Quick Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-400 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
        
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1EBDB8] to-[#16a19f] flex items-center justify-center text-white font-bold text-[14px] shadow-sm">
            AD
          </div>
          <div className="hidden sm:block">
            <p className="text-[14px] font-bold text-gray-900 group-hover:text-[#1EBDB8] transition-colors leading-tight">Admin User</p>
            <p className="text-[12px] font-medium text-gray-500 leading-tight">Super Admin</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hidden sm:block">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

    </header>
  );
}