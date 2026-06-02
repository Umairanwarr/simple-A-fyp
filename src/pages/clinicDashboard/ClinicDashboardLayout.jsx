import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ClinicSidebar from '../../components/clinicDashboard/ClinicSidebar';
import ClinicHeader from '../../components/clinicDashboard/ClinicHeader';
import ClinicAnalytics from '../../components/clinicDashboard/ClinicAnalytics';
import StaffManagement from '../../components/clinicDashboard/StaffManagement';
import ClinicSubscription from '../../components/clinicDashboard/ClinicSubscription';
import PromotionalMedia from '../../components/clinicDashboard/PromotionalMedia';
import AvatarUploadModal from '../../components/shared/AvatarUploadModal';
import ReportBugButton from '../../components/shared/ReportBugButton';
import ReportBugModal from '../../components/shared/ReportBugModal';
import { 
  submitBugReport, 
  updateClinicAvatar, 
  fetchClinicNotifications, 
  markClinicNotificationsRead 
} from '../../services/authApi';
import {
  clearRoleSession,
  getClinicSessionProfile,
  hasSessionAvatar,
  saveSessionUser
} from '../../utils/authSession';

const TAB_PATHS = {
  analytics: '/clinic/dashboard',
  staff: '/clinic/dashboard/staff',
  schedule: '/clinic/dashboard/schedule',
  availability: '/clinic/dashboard/availability',
  appointments: '/clinic/dashboard/appointments',
  chats: '/clinic/dashboard/chats',
  subscriptions: '/clinic/dashboard/subscriptions',
  media: '/clinic/dashboard/media',
  reviews: '/clinic/dashboard/reviews',
  profile: '/clinic/dashboard/profile'
};

export default function ClinicDashboardLayout({ activeTab = 'analytics', children }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAvatarMandatory, setIsAvatarMandatory] = useState(false);
  const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);
  const [isSubmittingBugReport, setIsSubmittingBugReport] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isMarkingNotificationsRead, setIsMarkingNotificationsRead] = useState(false);

  const loadNotifications = async () => {
    const clinicToken = localStorage.getItem('clinicToken');
    if (!clinicToken) return;

    try {
      const data = await fetchClinicNotifications(clinicToken);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Fail silently
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleMarkNotificationsAsRead = async () => {
    if (unreadCount <= 0 || isMarkingNotificationsRead) return;

    const clinicToken = localStorage.getItem('clinicToken');
    if (!clinicToken) return;

    try {
      setIsMarkingNotificationsRead(true);
      await markClinicNotificationsRead(clinicToken);
      setUnreadCount(0);
    } catch {
      // Fail silently
    } finally {
      setIsMarkingNotificationsRead(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 45000); // 45 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!hasSessionAvatar('clinic')) {
      setIsAvatarMandatory(true);
      setIsAvatarModalOpen(true);
    }
  }, []);

  const handleLogout = () => {
    clearRoleSession({ tokenKey: 'clinicToken', userKey: 'clinic' });
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  const handleOpenAvatarModal = () => {
    setIsAvatarMandatory(!hasSessionAvatar('clinic'));
    setIsAvatarModalOpen(true);
  };

  const handleCloseAvatarModal = () => {
    if (isAvatarMandatory) {
      return;
    }

    setIsAvatarModalOpen(false);
  };

  const handleAvatarSave = async (avatarFile) => {
    const clinicToken = localStorage.getItem('clinicToken');

    if (!clinicToken) {
      throw new Error('Please login again to update avatar');
    }

    const data = await updateClinicAvatar(clinicToken, avatarFile);
    saveSessionUser('clinic', data.clinic);
    setIsAvatarMandatory(false);
    setIsAvatarModalOpen(false);
  };

  const handleSubmitBugReport = async (payload) => {
    const clinicToken = localStorage.getItem('clinicToken');

    if (!clinicToken) {
      toast.error('Please login again to continue');
      navigate('/signin');
      return;
    }

    try {
      setIsSubmittingBugReport(true);
      await submitBugReport(clinicToken, payload);
      toast.success('Bug report submitted successfully');
      setIsBugReportModalOpen(false);
    } catch (error) {
      toast.error(error?.message || 'Could not submit bug report');
    } finally {
      setIsSubmittingBugReport(false);
    }
  };

  const handleSidebarTabChange = (tabId) => {
    const normalizedTabId = String(tabId || '').trim();
    navigate(TAB_PATHS[normalizedTabId] || '/clinic/dashboard');
  };

  return (
    <div className="flex bg-[#FAFAFB] min-h-screen font-sans overflow-x-hidden">
      <ClinicSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        onTabChange={handleSidebarTabChange}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 min-w-0 ml-0 lg:ml-[260px] flex flex-col relative h-screen">
        <div className="px-5 sm:px-10 lg:px-14 flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden pb-10 custom-scrollbar">
          <ClinicHeader 
            onMenuClick={() => setIsSidebarOpen(true)} 
            activeTab={activeTab}
            onAvatarClick={handleOpenAvatarModal}
            notifications={notifications}
            unreadCount={unreadCount}
            isLoadingNotifications={isLoadingNotifications}
            onNotificationsOpen={handleMarkNotificationsAsRead}
          />
          
          <main className="mt-2 md:mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </main>
        </div>

        {activeTab !== 'chats' && (
          <ReportBugButton onClick={() => setIsBugReportModalOpen(true)} />
        )}
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        canClose={!isAvatarMandatory}
        currentAvatar={hasSessionAvatar('clinic') ? getClinicSessionProfile().avatarUrl : ''}
        title="Upload Profile Picture"
        description="Please upload your clinic profile picture to continue."
        onClose={handleCloseAvatarModal}
        onSave={handleAvatarSave}
      />

      <ReportBugModal
        isOpen={isBugReportModalOpen}
        isSubmitting={isSubmittingBugReport}
        onClose={() => {
          if (!isSubmittingBugReport) {
            setIsBugReportModalOpen(false);
          }
        }}
        onSubmit={handleSubmitBugReport}
      />
    </div>
  );
}
