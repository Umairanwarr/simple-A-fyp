import React from 'react';

export default function Header({ onMenuClick, activeTab }) {
  const getTitle = () => {
    switch (activeTab) {
      case 'analytics': return 'Analytics Dashboard';
      case 'clinic': return 'Virtual Clinic';
      case 'streaming': return 'Advanced Live Streaming';
      case 'subscriptions': return 'Subscription & Ads Manager';
      case 'prescriptions': return 'Digital Prescriptions';
      case 'media': return 'Media Management';
      default: return 'Doctor Dashboard';
    }
  };

  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-[#1F2432] hover:bg-black/5 rounded-lg transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h1 className="text-[28px] font-bold text-[#1F2432] tracking-tight">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <button className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow text-[#1F2432]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-[14px] font-bold text-[#1F2432]">Dr. Smith</p>
            <p className="text-[12px] text-[#9ca3af] font-medium">Cardiologist</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#1EBDB8] overflow-hidden border-2 border-white shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=DrSmith" alt="Doctor" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
}
