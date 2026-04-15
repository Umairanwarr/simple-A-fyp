import React from 'react';

export default function Sidebar({ isOpen, onClose, activeTab, onTabChange, onLogout }) {
  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )},
    { id: 'appointments', label: 'Appointments', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="12" cy="15" r="2.5"/>
        <line x1="12" y1="13.5" x2="12" y2="15"/>
        <line x1="12" y1="15" x2="13.2" y2="16"/>
      </svg>
    )},
    { id: 'schedule', label: 'My Schedule', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )},
    { id: 'availability', label: 'Set Availability', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="12" y1="14" x2="12" y2="18"/>
        <line x1="10" y1="16" x2="14" y2="16"/>
      </svg>
    )},
    { id: 'clinic', label: 'Virtual Clinic', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    )},
    { id: 'chats', label: 'Chats', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )},
    { id: 'prescriptions', label: 'Prescription', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    )},
    { id: 'streaming', label: 'Live Streaming', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.6 11.6L22 7v10l-6.4-4.6z"/><rect x="2" y="5" width="14" height="14" rx="2"/>
      </svg>
    )},
    { id: 'subscriptions', label: 'Subscription', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    )},
    { id: 'media', label: 'Media Manager', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    )},
    { id: 'reviews', label: 'Reviews', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    )},
    { id: 'profile', label: 'Profile', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>
      </svg>
    )},
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

      <div className={`w-[260px] h-screen bg-[#1F2432] rounded-tr-[40px] rounded-br-[40px] flex flex-col fixed left-0 top-0 z-[70] transition-transform duration-300 overflow-hidden ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'}`}>
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
      
        <div className="flex-1 mt-4 px-3 overflow-y-auto">
          <div className="flex flex-col gap-2 pb-4">
            {menuItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => { onTabChange(item.id); onClose(); }}
                className={`flex items-center gap-4 py-4 pl-6 pr-6 w-full text-left transition-all duration-200 group ${
                  activeTab === item.id 
                    ? 'bg-[#1EBDB8] text-white rounded-[20px] shadow-lg translate-x-2' 
                    : 'text-[#9ca3af] hover:text-white hover:bg-white/5 rounded-[20px]'
                }`}
              >
                <div className={`flex justify-center items-center shrink-0 ${activeTab === item.id ? 'text-white' : 'text-[#9ca3af] group-hover:text-white'}`}>
                  {item.icon}
                </div>
                <span className={`text-[16px] font-medium tracking-wide truncate ${activeTab === item.id ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto mb-10 px-6 shrink-0">
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
