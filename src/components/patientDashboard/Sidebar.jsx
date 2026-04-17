import React from 'react';

export default function Sidebar({ isOpen, onClose, onLogout, activeTab, onTabChange }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', iconSrc: '/dashboard.svg' },
    { id: 'profile', label: 'Profile', iconSrc: '/profile.svg' },
    { id: 'appointments', label: 'Appointments', iconSrc: '/appoinments.svg' },
    { id: 'explore', label: 'Explore', iconSrc: '/explore.svg' },
    { id: 'favorites', label: 'Favorites', iconSrc: '/fav.svg' },
    { id: 'history', label: 'History', iconSrc: '/history.svg' },
    { id: 'chats', label: 'Chats', iconSrc: '/chat.svg' },
    { id: 'prescriptions', label: 'Prescriptions', iconSvg: true },
    { id: 'livestreams', label: 'Live Streams', iconSvg: true },
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
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange?.(item.id);
                  onClose();
                }}
                className={`flex items-center gap-5 py-4 pl-8 pr-6 cursor-pointer transition-colors text-left ${
                  isActive
                  ? 'bg-[#1EBDB8] text-white rounded-r-[28px] mr-6 shadow-md'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
              >
                <div className={`flex justify-center items-center w-[22px] h-[22px] ${isActive ? 'opacity-100' : 'opacity-60 grayscale'}`}>
                  {item.iconSvg ? (
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      {item.id === 'livestreams' ? (
                        <><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>
                      ) : (
                        <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></>
                      )}
                    </svg>
                  ) : (
                    <img src={item.iconSrc} alt={item.label} className="w-full h-full object-contain" />
                  )}
                </div>
                <span className={`text-[17px] font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto mb-10 px-6">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-4 py-4 pl-2 text-[#9ca3af] hover:text-red-400 transition-colors w-full"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="text-[16px] font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
