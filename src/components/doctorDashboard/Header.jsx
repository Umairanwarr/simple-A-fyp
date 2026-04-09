import React from 'react';
import { getDoctorSessionProfile } from '../../utils/authSession';

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

export default function Header({
  onMenuClick,
  activeTab,
  onAvatarClick,
  notifications = [],
  unreadNotificationCount = 0,
  isNotificationsLoading = false,
  onNotificationsOpen
}) {
  const {
    name: doctorName,
    email: doctorEmail,
    avatarUrl: doctorAvatarUrl
  } = getDoctorSessionProfile();
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const normalizedUnreadCount = Math.max(0, Math.trunc(Number(unreadNotificationCount || 0)));
  const hasUnreadNotifications = normalizedUnreadCount > 0;

  const getTitle = () => {
    switch (activeTab) {
      case 'analytics': return 'Analytics Dashboard';
      case 'profile': return 'Doctor Profile';
      case 'reviews': return 'Patient Reviews';
      case 'schedule': return 'My Schedule';
      case 'clinic': return 'Virtual Clinic';
      case 'availability': return 'Set Availability';
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
        <div className="hidden sm:block relative group" onMouseEnter={() => onNotificationsOpen?.()}>
          <button
            type="button"
            className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow text-[#1F2432]"
            aria-label="Booking notifications"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {hasUnreadNotifications ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full border-2 border-[#FAFAFB] flex items-center justify-center text-[10px] leading-none font-bold text-white">
                {normalizedUnreadCount > 9 ? '9+' : normalizedUnreadCount}
              </span>
            ) : null}
          </button>

          <div className="pointer-events-none absolute right-0 top-[calc(100%+12px)] z-40 w-[340px] rounded-[20px] border border-gray-100 bg-white shadow-[0px_20px_45px_rgba(0,0,0,0.12)] opacity-0 invisible translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:pointer-events-auto">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-[14px] font-bold text-[#1F2432]">Booking Notifications</h3>
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

        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-[14px] font-bold text-[#1F2432]">{doctorName}</p>
            <p className="text-[12px] text-[#9ca3af] font-medium">{doctorEmail || 'Doctor Account'}</p>
          </div>
          <button
            type="button"
            onClick={onAvatarClick}
            className="w-12 h-12 rounded-2xl bg-[#1EBDB8] overflow-hidden border-2 border-white shadow-sm"
          >
            <img src={doctorAvatarUrl} alt={doctorName} className="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </header>
  );
}
