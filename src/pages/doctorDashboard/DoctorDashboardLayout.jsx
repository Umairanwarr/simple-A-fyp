import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/doctorDashboard/Sidebar';
import Header from '../../components/doctorDashboard/Header';
import AvatarUploadModal from '../../components/shared/AvatarUploadModal';
import ReportBugButton from '../../components/shared/ReportBugButton';
import ReportBugModal from '../../components/shared/ReportBugModal';
import {
  fetchDoctorNotifications,
  markDoctorNotificationsRead,
  submitBugReport,
  updateDoctorAvatar
} from '../../services/authApi';
import {
  clearRoleSession,
  getDoctorSessionProfile,
  hasSessionAvatar,
  saveSessionUser
} from '../../utils/authSession';

const TAB_PATHS = {
  analytics: '/doctor/dashboard',
  profile: '/doctor/dashboard/profile',
  reviews: '/doctor/dashboard/reviews',
  schedule: '/doctor/dashboard/schedule',
  appointments: '/doctor/dashboard/appointments',
  clinic: '/doctor/dashboard/clinic',
  availability: '/doctor/dashboard/availability',
  streaming: '/doctor/dashboard/streaming',
  subscriptions: '/doctor/dashboard/subscriptions',
  prescriptions: '/doctor/dashboard/prescriptions',
  media: '/doctor/dashboard/media',
  chats: '/doctor/dashboard/chats'
};

export default function DoctorDashboardLayout({ activeTab = 'analytics', children }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setDoctorSessionVersion] = useState(0);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAvatarMandatory, setIsAvatarMandatory] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isMarkingNotificationsRead, setIsMarkingNotificationsRead] = useState(false);
  const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);
  const [isSubmittingBugReport, setIsSubmittingBugReport] = useState(false);

  useEffect(() => {
    if (!hasSessionAvatar('doctor')) {
      setIsAvatarMandatory(true);
      setIsAvatarModalOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleDoctorSessionUpdated = () => {
      setDoctorSessionVersion((currentVersion) => currentVersion + 1);
    };

    window.addEventListener('doctor-session-updated', handleDoctorSessionUpdated);

    return () => {
      window.removeEventListener('doctor-session-updated', handleDoctorSessionUpdated);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDoctorNotifications = async () => {
      const doctorToken = localStorage.getItem('doctorToken');

      if (!doctorToken) {
        if (isMounted) {
          setNotifications([]);
          setIsNotificationsLoading(false);
        }

        return;
      }

      try {
        const data = await fetchDoctorNotifications(doctorToken);

        if (!isMounted) {
          return;
        }

        setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
        setUnreadNotificationCount(Math.max(0, Math.trunc(Number(data?.unreadCount || 0))));
      } catch (error) {
        if (isMounted) {
          setNotifications([]);
          setUnreadNotificationCount(0);
        }
      } finally {
        if (isMounted) {
          setIsNotificationsLoading(false);
        }
      }
    };

    loadDoctorNotifications();

    const pollingIntervalId = window.setInterval(() => {
      loadDoctorNotifications();
    }, 30000);

    const refreshHandler = () => {
      loadDoctorNotifications();
    };

    window.addEventListener('doctor-appointment-updated', refreshHandler);

    return () => {
      isMounted = false;
      window.clearInterval(pollingIntervalId);
      window.removeEventListener('doctor-appointment-updated', refreshHandler);
    };
  }, []);

  const handleNotificationsOpen = async () => {
    if (unreadNotificationCount <= 0 || isMarkingNotificationsRead) {
      return;
    }

    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      return;
    }

    try {
      setIsMarkingNotificationsRead(true);
      await markDoctorNotificationsRead(doctorToken);
      setUnreadNotificationCount(0);
    } catch (error) {
      // Keep unread badge on failure.
    } finally {
      setIsMarkingNotificationsRead(false);
    }
  };

  const handleLogout = () => {
    clearRoleSession({ tokenKey: 'doctorToken', userKey: 'doctor' });
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  const handleOpenAvatarModal = () => {
    setIsAvatarMandatory(!hasSessionAvatar('doctor'));
    setIsAvatarModalOpen(true);
  };

  const handleCloseAvatarModal = () => {
    if (isAvatarMandatory) {
      return;
    }

    setIsAvatarModalOpen(false);
  };

  const handleAvatarSave = async (avatarFile) => {
    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      throw new Error('Please login again to update avatar');
    }

    const data = await updateDoctorAvatar(doctorToken, avatarFile);
    saveSessionUser('doctor', data.doctor);
    setIsAvatarMandatory(false);
    setIsAvatarModalOpen(false);
  };

  const handleProfileUpdated = (data) => {
    const missingFields = Array.isArray(data?.profile?.missingFields) ? data.profile.missingFields : [];

    if (missingFields.length > 0) {
      setIsAvatarMandatory(missingFields.includes('avatar'));
      return;
    }

    setIsAvatarMandatory(false);
  };

  const handleSubmitBugReport = async (payload) => {
    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      toast.error('Please login again to continue');
      navigate('/signin');
      return;
    }

    try {
      setIsSubmittingBugReport(true);
      await submitBugReport(doctorToken, payload);
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
    navigate(TAB_PATHS[normalizedTabId] || '/doctor/dashboard');
  };

  const sharedPageProps = {
    handleProfileUpdated
  };

  const content = typeof children === 'function' ? children(sharedPageProps) : children;

  return (
    <div className="flex bg-[#FAFAFB] min-h-screen font-sans overflow-x-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={handleSidebarTabChange}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0 ml-0 lg:ml-[260px] flex flex-col relative h-screen">
        <div className="px-5 sm:px-10 lg:px-14 flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden pb-10 custom-scrollbar">
          <Header
            onMenuClick={() => setIsSidebarOpen(true)}
            activeTab={activeTab}
            onAvatarClick={handleOpenAvatarModal}
            notifications={notifications}
            unreadNotificationCount={unreadNotificationCount}
            isNotificationsLoading={isNotificationsLoading}
            onNotificationsOpen={handleNotificationsOpen}
          />

          <main className="mt-2 md:mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {content}
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
        currentAvatar={hasSessionAvatar('doctor') ? getDoctorSessionProfile().avatarUrl : ''}
        title="Upload Profile Picture"
        description="Please upload a profile picture to access your dashboard."
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
