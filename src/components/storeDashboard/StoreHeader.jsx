import React, { useState, useEffect, useRef } from 'react';
import { getMedicalStoreSessionProfile } from '../../utils/authSession';
import { fetchStoreNotifications, markStoreNotificationsRead } from '../../services/authApi';

const fmtNotifDate = (d) => {
  if (!d) return '';
  const p = new Date(d);
  if (isNaN(p)) return '';
  const now = new Date();
  const diffMs = now - p;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return p.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function StoreHeader({ onMenuClick, activeTab, onAvatarClick }) {
  const {
    name: storeName,
    email: storeEmail,
    avatarUrl: storeAvatarUrl,
    currentPlan: storeCurrentPlan
  } = getMedicalStoreSessionProfile();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('medicalStoreToken');
      if (!token) return;
      const data = await fetchStoreNotifications(token);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleToggleNotif = async () => {
    const nextState = !isNotifOpen;
    setIsNotifOpen(nextState);
    if (nextState && unreadCount > 0) {
      try {
        const token = localStorage.getItem('medicalStoreToken');
        await markStoreNotificationsRead(token);
        setUnreadCount(0);
      } catch (err) {
        console.error('Failed to mark notifications as read:', err);
      }
    }
  };

  const storePlanLabel = String(storeCurrentPlan || 'platinum')
    .trim()
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

  const getTitle = () => {
    switch (activeTab) {
      case 'analytics': return 'Store Analytics';
      case 'inventory': return 'Inventory Management';
      case 'subscriptions': return 'Subscription & Ads';
      case 'orders': return 'Orders & Prescriptions';
      case 'media': return 'Media Manager';
      case 'delivery': return 'Delivery Logistics';
      default: return 'Store Dashboard';
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
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotif}
            type="button"
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all border ${
              isNotifOpen 
                ? 'bg-[#1EBDB8] text-white border-[#1EBDB8] shadow-lg shadow-[#1EBDB8]/20' 
                : 'bg-white text-[#1F2432] border-gray-100 shadow-sm hover:shadow-md'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className={`absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full border-2 ${isNotifOpen ? 'bg-white border-[#1EBDB8]' : 'bg-red-500 border-white'}`}></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[999] animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1F2432]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#1EBDB8]/10 text-[#0F766E] text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    </div>
                    <p className="text-[14px] font-medium text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="px-6 py-4 hover:bg-gray-50/80 transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.type.includes('rejected') ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-[#1F2432] group-hover:text-[#1EBDB8] transition-colors">{notif.title}</p>
                            <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{fmtNotifDate(notif.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50/50 text-center">
                <button 
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[12px] font-bold text-[#1EBDB8] hover:text-[#1CAAAE]"
                >
                  Close Panel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-[14px] font-bold text-[#1F2432]">{storeName}</p>
            <p className="text-[12px] text-[#9ca3af] font-medium">{storeEmail || 'Store Admin'}</p>
            <p className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#1EBDB8]/12 text-[#0F766E] border border-[#1EBDB8]/25">
              {storePlanLabel} Plan
            </p>
          </div>
          <button
            type="button"
            onClick={onAvatarClick}
            className="w-12 h-12 rounded-2xl bg-[#1EBDB8] overflow-hidden border-2 border-white shadow-sm group"
          >
            {storeAvatarUrl ? (
              <img
                src={storeAvatarUrl}
                alt={storeName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName || 'S')}&background=1EBDB8&color=fff&bold=true`;
                }}
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-[18px] font-bold text-white">
                {String(storeName || 'S').charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
