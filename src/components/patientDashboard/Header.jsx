import React from 'react';
import { getPatientSessionProfile } from '../../utils/authSession';

const formatNotificationDateTime = (dateValue) => {
  if (!dateValue) {
    return 'Just now';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Just now';
  }

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const getTabTitle = (activeTab) => {
  switch (activeTab) {
    case 'explore':
      return 'Explore';
    case 'doctor-profile':
      return 'Doctor Profile';
    case 'favorites':
      return 'Favorites';
    case 'appointments':
      return 'Appointments';
    case 'history':
      return 'History';
    case 'chats':
      return 'Chats';
    default:
      return 'Dashboard';
  }
};

export default function Header({
  onMenuClick,
  onAvatarClick,
  activeTab = 'dashboard',
  notifications = [],
  unreadNotificationCount = 0,
  isNotificationsLoading = false,
  onNotificationsOpen
}) {
  const { name: patientName, avatarUrl: patientAvatarUrl } = getPatientSessionProfile();
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const normalizedUnreadCount = Math.max(0, Math.trunc(Number(unreadNotificationCount || 0)));
  const hasUnreadNotifications = normalizedUnreadCount > 0;

  return (
    <div className="w-full flex justify-between items-center py-5 sm:py-6 md:py-8 border-b border-gray-100 lg:border-none mb-2 lg:mb-0">
      {/* Desktop Left */}
      <div className="hidden lg:flex items-center gap-4">
        <h1 className="text-[#1EBDB8] font-bold text-[24px]">{getTabTitle(activeTab)}</h1>
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
        <button
          type="button"
          onClick={onAvatarClick}
          className="hidden sm:flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#1EBDB8]/30 bg-[#1EBDB8]/10">
            <img
              src={patientAvatarUrl}
              alt={patientName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[#4B5563] font-medium text-[14px] md:text-[15px]">{patientName}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        <div className="relative group" onMouseEnter={() => onNotificationsOpen?.()}>
          <button
            type="button"
            className="relative cursor-pointer"
            aria-label="Booking notifications"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="fill-[#6B7280] lg:w-6 lg:h-6">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {hasUnreadNotifications ? (
              <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-[#FAFAFB] flex items-center justify-center text-[10px] leading-none font-bold text-white">
                {normalizedUnreadCount > 9 ? '9+' : normalizedUnreadCount}
              </div>
            ) : null}
          </button>

          <div className="pointer-events-none absolute right-0 top-[calc(100%+12px)] z-40 w-[320px] rounded-[20px] border border-gray-100 bg-white shadow-[0px_20px_45px_rgba(0,0,0,0.12)] opacity-0 invisible translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-[14px] font-bold text-[#1F2937]">Booking Notifications</h3>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {isNotificationsLoading ? (
                <p className="px-4 py-6 text-[13px] text-[#6B7280] font-medium text-center">Loading notifications...</p>
              ) : null}

              {!isNotificationsLoading && safeNotifications.length === 0 ? (
                <p className="px-4 py-6 text-[13px] text-[#6B7280] font-medium text-center">No booking updates yet.</p>
              ) : null}

              {!isNotificationsLoading && safeNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-[#F8FAFC] transition-colors"
                >
                  <p className="text-[13px] font-bold text-[#111827]">{notification.title}</p>
                  <p className="text-[12px] text-[#4B5563] mt-1 leading-relaxed">{notification.message}</p>
                  <p className="text-[11px] text-[#9CA3AF] mt-2 font-medium">{formatNotificationDateTime(notification.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
