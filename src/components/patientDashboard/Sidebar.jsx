import React from 'react';

export default function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { label: 'Dashboard', iconSrc: '/dashboard.svg', active: true },
    { label: 'Appointments', iconSrc: '/appoinments.svg' },
    { label: 'Explore', iconSrc: '/explore.svg' },
    { label: 'Favorites', iconSrc: '/fav.svg' },
    { label: 'History', iconSrc: '/history.svg' },
    { label: 'Chats', iconSrc: '/chat.svg' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[60] lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={`w-[260px] h-screen bg-[#1F2432] rounded-tr-[40px] rounded-br-[40px] flex flex-col fixed left-0 top-0 z-[70] transition-transform duration-300 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}`}>
        <div className="flex items-center justify-between pt-12 pb-10 pl-8 pr-6">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Simple Logo" 
              className="h-10 w-auto brightness-0 invert" 
            />
            <span className="text-[26px] font-bold text-white tracking-wide pb-1">Simple</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      
      <div className="flex flex-col gap-3 mt-4">
        {menuItems.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-5 py-4 pl-8 pr-6 cursor-pointer transition-colors ${
              item.active 
                ? 'bg-[#1EBDB8] text-white rounded-r-[28px] mr-6 shadow-md' 
                : 'text-[#9ca3af] hover:text-white'
            }`}
          >
            <div className={`flex justify-center items-center w-[22px] h-[22px] ${item.active ? 'opacity-100' : 'opacity-60 grayscale'}`}>
               <img src={item.iconSrc} alt={item.label} className="w-full h-full object-contain" />
            </div>
            <span className={`text-[17px] font-medium tracking-wide ${item.active ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
