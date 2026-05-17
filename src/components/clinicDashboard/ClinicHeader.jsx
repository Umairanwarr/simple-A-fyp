import React from 'react';
import { getClinicSessionProfile } from '../../utils/authSession';

const tabTitles = {
  analytics: 'Clinic Performance Analytics',
  staff: 'Service Management',
  schedule: 'Clinic Doctor Schedule',
  availability: 'Doctor Availability',
  appointments: 'Clinic Appointments',
  chats: 'Clinic Chats',
  subscriptions: 'Facility Plans & Advertising',
  media: 'Promotional Assets & Media',
  reviews: 'Clinic Reviews',
  profile: 'Clinic Profile'
};

const formatNotificationDateTime = (dateValue) => {
  if (!dateValue) return 'Just now';
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'Just now';
  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export default function ClinicHeader({ 
  onMenuClick, 
  activeTab, 
  onAvatarClick,
  notifications = [],
  unreadCount = 0,
  isLoadingNotifications = false,
  onNotificationsOpen
}) {
  const {
    name: clinicName,
    email: clinicEmail,
    avatarUrl: clinicAvatarUrl
  } = getClinicSessionProfile();

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const normalizedUnreadCount = Math.max(0, Math.trunc(Number(unreadCount || 0)));
  const hasUnreadNotifications = normalizedUnreadCount > 0;

  return (
    <header className="flex items-center justify-between py-6 md:py-8 lg:py-10 bg-[#FAFAFB]/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 w-full">
      <div className="flex items-center gap-4 min-w-0">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#1F2432] hover:bg-gray-50 transition-colors shrink-0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div className="hidden sm:block min-w-0">
          <h1 className="text-[20px] md:text-[22px] lg:text-[26px] font-bold text-[#1F2432] tracking-tight truncate">{tabTitles[activeTab] || 'Clinic Dashboard'}</h1>
          <p className="text-[12px] lg:text-[13px] text-gray-400 font-medium tracking-wide truncate">Manage your facility operations efficiently</p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-5 shrink-0">
        {/* Notifications */}
        <div className="relative group" onMouseEnter={() => onNotificationsOpen?.()}>
          <button 
            type="button"
            className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#1F2432] hover:bg-gray-50 transition-all relative"
          >
            <svg className="group-hover:rotate-12 transition-transform" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            {hasUnreadNotifications && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-[#FAFAFB] flex items-center justify-center text-[10px] leading-none font-bold text-white">
                {normalizedUnreadCount > 9 ? '9+' : normalizedUnreadCount}
              </span>
            )}
          </button>

          <div className="pointer-events-none absolute right-0 top-[calc(100%+12px)] z-40 w-[320px] rounded-[24px] border border-gray-100 bg-white shadow-[0px_20px_45px_rgba(0,0,0,0.12)] opacity-0 invisible translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-[#FAFAFB]/50">
              <h3 className="text-[14px] font-bold text-[#1F2432]">Facility Alerts</h3>
            </div>

            <div className="max-h-[340px] overflow-y-auto custom-scrollbar">
              {isLoadingNotifications && (
                <p className="px-6 py-8 text-[13px] text-gray-500 font-medium text-center italic">Updating alerts...</p>
              )}

              {!isLoadingNotifications && safeNotifications.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="text-gray-300" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  </div>
                  <p className="text-[13px] text-gray-400 font-medium">No new notifications</p>
                </div>
              )}

              {!isLoadingNotifications && safeNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-5 py-4 border-b border-gray-50 last:border-b-0 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.type.includes('rejected') ? 'bg-red-500' : 'bg-[#1EBDB8]'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[#1F2432] leading-tight">{notif.title}</p>
                      <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed">{notif.message}</p>
                      <p className="text-[11px] text-gray-400 mt-2 font-semibold uppercase tracking-wider">{formatNotificationDateTime(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
