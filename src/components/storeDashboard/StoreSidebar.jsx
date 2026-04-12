import React from 'react';

const navItems = [
  { id: 'analytics', label: 'Store Analytics', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
  { id: 'inventory', label: 'Inventory Management', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
    </svg>
  )},
  { id: 'subscriptions', label: 'Subscription & Ads', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  )},
  { id: 'orders', label: 'Orders & Prescriptions', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  )},
  { id: 'media', label: 'Media Uploading', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  )},
  { id: 'delivery', label: 'Delivery Logistics', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
    </svg>
  )},
];

export default function StoreSidebar({ isOpen, onClose, activeTab, onTabChange, onLogout }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm transition-all"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-[#1EBDB8] text-white shadow-[0_10px_20px_rgba(30,189,184,0.3)]' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`${activeTab === item.id ? 'text-white' : 'text-[#1EBDB8] group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </span>
              <span className="text-[14px] font-semibold tracking-tight whitespace-nowrap">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#1EBDB8]/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-[#1EBDB8]/20 transition-colors" />
            <p className="text-white/40 text-[12px] font-bold uppercase tracking-[0.15em] mb-2">Store Plan</p>
            <p className="text-white font-bold text-[18px] mb-4">Premium Store</p>
            <button className="w-full py-3 bg-[#1EBDB8] text-white text-[13px] font-bold rounded-xl hover:bg-[#1CAAAE] transition-all shadow-lg active:scale-95">
              Upgrade Store
            </button>
          </div>
          
          <button
            type="button"
            onClick={onLogout}
            className="w-full mt-6 flex items-center gap-4 px-6 py-4 text-white/50 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span className="text-[15px] font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
