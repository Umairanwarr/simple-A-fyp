import React from 'react';

export default function Header({ onMenuClick }) {
  return (
    <div className="w-full flex justify-between items-center py-5 sm:py-6 md:py-8 border-b border-gray-100 lg:border-none mb-2 lg:mb-0">
      {/* Desktop Left */}
      <div className="hidden lg:flex items-center gap-4">
        <h1 className="text-[#1EBDB8] font-bold text-[24px]">Dashboard</h1>
      </div>

      {/* Mobile Left (Hamburger & Logo) */}
      <div className="flex lg:hidden items-center gap-3">
        <button onClick={onMenuClick} className="text-[#4B5563] hover:text-[#1EBDB8] transition-colors p-1">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="flex items-center gap-1.5 ml-1">
          <img 
            src="/logo.svg" 
            alt="Simple Logo" 
            className="h-6 w-auto"
            style={{ filter: 'invert(52%) sepia(85%) saturate(417%) hue-rotate(128deg) brightness(97%) contrast(93%)' }}
          />
          <span className="text-[20px] font-bold text-[#1EBDB8] tracking-wide">Simple</span>
        </div>
      </div>
      
      {/* Right Side (Profile & Notifications) */}
      <div className="flex items-center gap-4 md:gap-8">
        <div className="hidden sm:flex items-center gap-2 cursor-pointer">
          <span className="text-[#4B5563] font-medium text-[14px] md:text-[15px]">Zain Ul Hassan</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        
        <div className="relative cursor-pointer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="fill-[#6B7280] lg:w-6 lg:h-6">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#FAFAFB]"></div>
        </div>
      </div>
    </div>
  );
}
