import React from 'react';
import { getClinicSessionProfile } from '../../utils/authSession';

const tabTitles = {
  analytics: 'Clinic Performance Analytics',
  staff: 'Medical Staff Management',
  subscriptions: 'Facility Plans & Advertising',
  media: 'Promotional Assets & Media',
  streaming: 'Clinic-Wide Broadcasting',
};

export default function ClinicHeader({ onMenuClick, activeTab, onAvatarClick }) {
  const {
    name: clinicName,
    email: clinicEmail,
    avatarUrl: clinicAvatarUrl
  } = getClinicSessionProfile();

  return (
    <header className="flex items-center justify-between py-6 md:py-8 lg:py-10 bg-[#FAFAFB]/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#1F2432] hover:bg-gray-50 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div className="hidden sm:block">
          <h1 className="text-[26px] font-semibold text-[#1F2432] tracking-tight">{tabTitles[activeTab] || 'Clinic Dashboard'}</h1>
          <p className="text-[13px] text-gray-400 font-medium tracking-wide">Manage your facility operations efficiently</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 group focus-within:ring-2 focus-within:ring-[#1EBDB8]/20 transition-all w-[260px]">
          <svg className="text-gray-400 group-focus-within:text-[#1EBDB8] transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search records..." 
            className="ml-3 text-[14px] font-medium text-[#1F2432] bg-transparent outline-none border-none placeholder:text-gray-400 w-full"
          />
        </div>

        {/* Notifications */}
        <button className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#1F2432] hover:bg-gray-50 transition-all relative group">
          <svg className="group-hover:rotate-12 transition-transform" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Clinic Profile */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-[14px] font-bold text-[#1F2432]">{clinicName}</p>
            <p className="text-[11px] font-bold text-[#1EBDB8] uppercase tracking-[0.1em]">
              {clinicEmail || 'Facility Admin'}
            </p>
          </div>
          <button
            type="button"
            onClick={onAvatarClick}
            className="relative group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1EBDB8] to-[#1CAAAE] p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-white rounded-2xl overflow-hidden border-2 border-white">
                <img 
                  src={clinicAvatarUrl}
                  alt={clinicName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="absolute bottom-[-2px] right-[-2px] w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </button>
        </div>
      </div>
    </header>
  );
}
