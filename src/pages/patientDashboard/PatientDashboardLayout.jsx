import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../../components/patientDashboard/Sidebar';
import Header from '../../components/patientDashboard/Header';
import AppointmentReviewPromptModal from '../../components/patientDashboard/AppointmentReviewPromptModal';
import AvatarUploadModal from '../../components/shared/AvatarUploadModal';
import ReportBugButton from '../../components/shared/ReportBugButton';
import ReportBugModal from '../../components/shared/ReportBugModal';
import {
  addPatientFavoriteDoctor,
  fetchPatientFavoriteDoctors,
  fetchPatientNotifications,
  fetchPatientPendingReviewAppointment,
  markPatientNotificationsRead,
  removePatientFavoriteDoctor,
  skipPatientAppointmentReview,
  submitBugReport,
  submitPatientAppointmentReview,
  updatePatientAvatar
} from '../../services/authApi';
import {
  clearRoleSession,
  getPatientSessionProfile,
  hasSessionAvatar,
  saveSessionUser
} from '../../utils/authSession';

const TAB_PATHS = {
  dashboard: '/dashboard',
  profile: '/dashboard/profile',
  appointments: '/dashboard/appointments',
  explore: '/dashboard/explore',
  favorites: '/dashboard/favorites',
  history: '/dashboard/history',
  chats: '/dashboard/chats',
  prescriptions: '/dashboard/prescriptions',
  livestreams: '/dashboard/livestreams'
};

const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || '').trim());

export default function PatientDashboardLayout({ activeTab = 'dashboard', children }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAvatarMandatory, setIsAvatarMandatory] = useState(false);
  const [favoriteDoctors, setFavoriteDoctors] = useState([]);
  const [favoriteDoctorIds, setFavoriteDoctorIds] = useState([]);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
  const [favoriteActionDoctorIds, setFavoriteActionDoctorIds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isMarkingNotificationsRead, setIsMarkingNotificationsRead] = useState(false);
  const [pendingReviewAppointment, setPendingReviewAppointment] = useState(null);
  const [isReviewActionProcessing, setIsReviewActionProcessing] = useState(false);
  const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);
  const [isSubmittingBugReport, setIsSubmittingBugReport] = useState(false);

  const loadPatientNotifications = useCallback(async ({ shouldShowLoading = false } = {}) => {
    const patientToken = localStorage.getItem('patientToken');

    if (!patientToken) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      setIsNotificationsLoading(false);
      return;
    }

    try {
      if (shouldShowLoading) {
        setIsNotificationsLoading(true);
      }

      const data = await fetchPatientNotifications(patientToken);
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
      setUnreadNotificationCount(Math.max(0, Math.trunc(Number(data?.unreadCount || 0))));
    } catch (error) {
      setNotifications([]);
      setUnreadNotificationCount(0);
    } finally {
      if (shouldShowLoading) {
        setIsNotificationsLoading(false);
      }
    }
  }, []);

  const loadPendingReviewAppointment = useCallback(async () => {
    const patientToken = localStorage.getItem('patientToken');

    if (!patientToken) {
      setPendingReviewAppointment(null);
      return;
    }

    try {
      const data = await fetchPatientPendingReviewAppointment(patientToken);
      setPendingReviewAppointment(data?.appointment || null);
    } catch (error) {
      setPendingReviewAppointment(null);
    }
  }, []);

  useEffect(() => {
    if (!hasSessionAvatar('patient')) {
      setIsAvatarMandatory(true);
      setIsAvatarModalOpen(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadFavoriteDoctors = async () => {
      const patientToken = localStorage.getItem('patientToken');

      if (!patientToken) {
        if (isMounted) {
          setFavoriteDoctors([]);
          setFavoriteDoctorIds([]);
          setIsFavoritesLoading(false);
        }

        return;
      }

      try {
        setIsFavoritesLoading(true);
        const data = await fetchPatientFavoriteDoctors(patientToken);

        if (!isMounted) {
          return;
        }

        const doctors = Array.isArray(data?.doctors) ? data.doctors : [];
        const doctorIds = Array.isArray(data?.favoriteDoctorIds) ? data.favoriteDoctorIds : [];
        const storeIds = Array.isArray(data?.favoriteStoreIds) ? data.favoriteStoreIds : [];
        const combinedIds = [...doctorIds, ...storeIds].map(id => String(id));

        setFavoriteDoctors(doctors);
        setFavoriteDoctorIds(combinedIds);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error(error?.message || 'Could not load favorite doctors');
        setFavoriteDoctors([]);
        setFavoriteDoctorIds([]);
      } finally {
        if (isMounted) {
          setIsFavoritesLoading(false);
        }
      }
    };

    loadFavoriteDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadNotificationsSafely = async ({ shouldShowLoading = false } = {}) => {
      if (!isMounted) {
        return;
      }

      await loadPatientNotifications({ shouldShowLoading });
    };

    loadNotificationsSafely({ shouldShowLoading: true });

    const pollingIntervalId = window.setInterval(() => {
      loadNotificationsSafely();
    }, 30000);

    const refreshHandler = () => {
      loadNotificationsSafely();
    };

    window.addEventListener('patient-appointment-updated', refreshHandler);

    return () => {
      isMounted = false;
      window.clearInterval(pollingIntervalId);
      window.removeEventListener('patient-appointment-updated', refreshHandler);
    };
  }, [loadPatientNotifications]);

  useEffect(() => {
    let isMounted = true;

    const loadPendingReviewSafely = async () => {
      if (!isMounted) {
        return;
      }

      await loadPendingReviewAppointment();
    };

    loadPendingReviewSafely();

    const pollingIntervalId = window.setInterval(() => {
      loadPendingReviewSafely();
    }, 30000);

    const refreshHandler = () => {
      loadPendingReviewSafely();
    };

    window.addEventListener('patient-appointment-updated', refreshHandler);

    return () => {
      isMounted = false;
      window.clearInterval(pollingIntervalId);
      window.removeEventListener('patient-appointment-updated', refreshHandler);
    };
  }, [loadPendingReviewAppointment]);

  const handleLogout = () => {
    clearRoleSession({ tokenKey: 'patientToken', userKey: 'patient' });
    toast.success('Logged out successfully');
    navigate('/signin');
  };

  const handleOpenAvatarModal = () => {
    setIsAvatarMandatory(!hasSessionAvatar('patient'));
    setIsAvatarModalOpen(true);
  };

  const handleCloseAvatarModal = () => {
    if (isAvatarMandatory) {
      return;
    }

    setIsAvatarModalOpen(false);
  };

  const handleAvatarSave = async (avatarFile) => {
    const patientToken = localStorage.getItem('patientToken');

    if (!patientToken) {
      throw new Error('Please login again to update avatar');
    }

    const data = await updatePatientAvatar(patientToken, avatarFile);
    saveSessionUser('patient', data.patient);
    setIsAvatarMandatory(false);
    setIsAvatarModalOpen(false);
  };

  const handleProfileUpdated = (data) => {
    const missingFields = Array.isArray(data?.profile?.missingFields)
      ? data.profile.missingFields
      : [];

    if (missingFields.length === 0) {
      setIsAvatarMandatory(false);
      return;
    }

    setIsAvatarMandatory(missingFields.includes('avatar'));
  };

  const handleToggleFavoriteDoctor = async (doctor) => {
    const doctorId = String(doctor?.id || '').trim();

    if (!doctorId) {
      return;
    }

    if (favoriteActionDoctorIds.includes(doctorId)) {
      return;
    }

    const patientToken = localStorage.getItem('patientToken');

    if (!patientToken) {
      toast.error('Please login again to continue');
      navigate('/signin');
      return;
    }

    const isCurrentlyFavorite = favoriteDoctorIds.includes(doctorId);
    setFavoriteActionDoctorIds((previousDoctorIds) => [...previousDoctorIds, doctorId]);

    try {
      const response = isCurrentlyFavorite
        ? await removePatientFavoriteDoctor(patientToken, doctorId)
        : await addPatientFavoriteDoctor(patientToken, doctorId);
      const doctorsFromApi = Array.isArray(response?.doctors) ? response.doctors : [];
      const doctorIds = Array.isArray(response?.favoriteDoctorIds) ? response.favoriteDoctorIds : [];
      const storeIds = Array.isArray(response?.favoriteStoreIds) ? response.favoriteStoreIds : [];
      const combinedIds = [...doctorIds, ...storeIds].map(id => String(id));

      setFavoriteDoctors(doctorsFromApi);
      setFavoriteDoctorIds(combinedIds);
    } catch (error) {
      toast.error(error?.message || 'Could not update favorite doctors');
    } finally {
      setFavoriteActionDoctorIds((previousDoctorIds) => {
        return previousDoctorIds.filter((favoriteDoctorId) => favoriteDoctorId !== doctorId);
      });
    }
  };

  const openDoctorProfile = (doctorId, fromPath = '/dashboard/explore') => {
    const normalizedDoctorId = String(doctorId || '').trim();

    if (!isValidObjectId(normalizedDoctorId)) {
      toast.error('Doctor profile is not available right now');
      return;
    }

    navigate(`/dashboard/doctor/${normalizedDoctorId}?from=${encodeURIComponent(fromPath)}`);
  };

  const handleNotificationsOpen = async () => {
    if (unreadNotificationCount <= 0 || isMarkingNotificationsRead) {
      return;
    }

    const patientToken = localStorage.getItem('patientToken');

    if (!patientToken) {
      return;
    }

    try {
      setIsMarkingNotificationsRead(true);
      await markPatientNotificationsRead(patientToken);
      setUnreadNotificationCount(0);
    } catch (error) {
      // Keep unread badge if mark-read API fails.
    } finally {
      setIsMarkingNotificationsRead(false);
    }
  };

  const handleSubmitAppointmentReview = async ({ rating, comment }) => {
    const appointmentId = String(pendingReviewAppointment?.id || '').trim();
    const patientToken = localStorage.getItem('patientToken');

    if (!appointmentId || !patientToken) {
      return;
    }

    try {
      setIsReviewActionProcessing(true);
      await submitPatientAppointmentReview(patientToken, appointmentId, {
        rating,
        comment
      });

      toast.success('Thank you. Your review has been submitted.');
      setPendingReviewAppointment(null);
      window.dispatchEvent(new Event('patient-appointment-updated'));
      window.dispatchEvent(new Event('doctor-appointment-updated'));
      await loadPendingReviewAppointment();
    } catch (error) {
      toast.error(error?.message || 'Could not submit review right now');
    } finally {
      setIsReviewActionProcessing(false);
    }
  };

  const handleSkipAppointmentReview = async () => {
    const appointmentId = String(pendingReviewAppointment?.id || '').trim();
    const patientToken = localStorage.getItem('patientToken');

    if (!appointmentId || !patientToken) {
      return;
    }

    try {
      setIsReviewActionProcessing(true);
      await skipPatientAppointmentReview(patientToken, appointmentId, true);
      toast.success('Review skipped. You cannot rate this appointment again.');
      setPendingReviewAppointment(null);
      window.dispatchEvent(new Event('patient-appointment-updated'));
      await loadPendingReviewAppointment();
    } catch (error) {
      toast.error(error?.message || 'Could not skip review right now');
    } finally {
      setIsReviewActionProcessing(false);
    }
  };

  const handleSubmitBugReport = async (payload) => {
    const patientToken = localStorage.getItem('patientToken');

    if (!patientToken) {
      toast.error('Please login again to continue');
      navigate('/signin');
      return;
    }

    try {
      setIsSubmittingBugReport(true);
      await submitBugReport(patientToken, payload);
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
    navigate(TAB_PATHS[normalizedTabId] || '/dashboard');
  };

  const sharedPageProps = {
    favoriteDoctors,
    favoriteDoctorIds,
    favoriteActionDoctorIds,
    isFavoritesLoading,
    handleProfileUpdated,
    onToggleFavoriteDoctor: handleToggleFavoriteDoctor,
    openDoctorProfile
  };

  const content = typeof children === 'function' ? children(sharedPageProps) : children;

  return (
    <div className="flex bg-[#FAFAFB] min-h-screen font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={handleSidebarTabChange}
        onLogout={handleLogout}
      />

      <div className="flex-1 min-w-0 ml-0 lg:ml-[260px] flex flex-col relative h-screen">
        <div className="px-5 sm:px-10 lg:px-14 flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Header
            onMenuClick={() => setIsSidebarOpen(true)}
            onAvatarClick={handleOpenAvatarModal}
            activeTab={activeTab}
            notifications={notifications}
            unreadNotificationCount={unreadNotificationCount}
            isNotificationsLoading={isNotificationsLoading}
            onNotificationsOpen={handleNotificationsOpen}
          />
          <div className="mt-2 md:mt-4">
            {content}
          </div>
        </div>

        {activeTab !== 'chats' && (
          <ReportBugButton onClick={() => setIsBugReportModalOpen(true)} />
        )}
      </div>

      <AppointmentReviewPromptModal
        isOpen={Boolean(pendingReviewAppointment)}
        appointment={pendingReviewAppointment}
        isSubmitting={isReviewActionProcessing}
        onSubmit={handleSubmitAppointmentReview}
        onSkip={handleSkipAppointmentReview}
      />

      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        canClose={!isAvatarMandatory}
        currentAvatar={hasSessionAvatar('patient') ? getPatientSessionProfile().avatarUrl : ''}
        title="Upload Profile Picture"
        description="Add your profile picture to continue using your dashboard."
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
