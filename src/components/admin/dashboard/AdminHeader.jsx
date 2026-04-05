import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchAdminClinics, fetchAdminDoctors, fetchAdminMedicalStores } from '../../../services/authApi';

export default function AdminHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  useEffect(() => {
    let isMounted = true;

    const loadPendingDoctorNotifications = async () => {
      const adminToken = localStorage.getItem('adminToken');

      if (!adminToken) {
        return;
      }

      try {
        setLoadingNotifications(true);
        const [doctorData, clinicData, storeData] = await Promise.all([
          fetchAdminDoctors(adminToken),
          fetchAdminClinics(adminToken),
          fetchAdminMedicalStores(adminToken)
        ]);

        if (!isMounted) {
          return;
        }

        const pendingDoctors = (doctorData.doctors || []).filter((doctor) => {
          return doctor.emailVerified && doctor.applicationStatus === 'pending';
        });

        const pendingClinics = (clinicData.clinics || []).filter((clinic) => {
          return clinic.emailVerified && clinic.applicationStatus === 'pending';
        });

        const pendingStores = (storeData.stores || []).filter((store) => {
          return store.emailVerified && store.applicationStatus === 'pending';
        });

        const mergedPending = [
          ...pendingDoctors.map((doctor) => ({
            id: `doctor-${doctor.id}`,
            type: 'doctor',
            name: doctor.fullName
          })),
          ...pendingClinics.map((clinic) => ({
            id: `clinic-${clinic.id}`,
            type: 'clinic',
            name: clinic.name
          })),
          ...pendingStores.map((store) => ({
            id: `store-${store.id}`,
            type: 'store',
            name: store.name
          }))
        ];

        setPendingApplications(mergedPending);
      } catch (error) {
        if (isMounted) {
          setPendingApplications([]);
        }
      } finally {
        if (isMounted) {
          setLoadingNotifications(false);
        }
      }
    };

    loadPendingDoctorNotifications();

    const interval = setInterval(loadPendingDoctorNotifications, 45000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const notificationCount = pendingApplications.length;
  const notificationPreview = useMemo(() => pendingApplications.slice(0, 5), [pendingApplications]);

  return (
    <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 font-sans sticky top-0 z-30">
      
      {/* Left side: Hamburger (mobile only) & Search */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="hidden md:flex relative w-[320px]">
          <svg 
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search users and applications..." 
            className="w-full bg-[#F5F5F5E5] text-[#4B5563] text-[14px] font-medium py-2.5 pl-10 pr-4 rounded-full outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 border border-transparent focus:border-[#1EBDB8] transition-all placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right side: Notifications & Quick Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="relative group/notifications">
          <button
            onClick={() => {
              const firstPending = notificationPreview[0];

              if (firstPending?.type === 'clinic') {
                navigate('/admin/users/clinics');
                return;
              }

              if (firstPending?.type === 'store') {
                navigate('/admin/users/stores');
                return;
              }

              navigate('/admin/users/doctors');
            }}
            className="relative p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>

            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[11px] font-bold rounded-full border-2 border-white flex items-center justify-center leading-none">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          <div className="absolute right-0 top-[46px] w-[340px] bg-white border border-gray-200 rounded-2xl shadow-[0_14px_38px_rgb(15,23,42,0.12)] p-3 opacity-0 invisible translate-y-1 group-hover/notifications:opacity-100 group-hover/notifications:visible group-hover/notifications:translate-y-0 transition-all duration-200 z-50">
            <div className="flex items-center justify-between px-1 py-2 border-b border-gray-100 mb-2">
              <h3 className="text-[13px] font-bold text-gray-900">Notifications</h3>
              {notificationCount > 0 && (
                <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {notificationCount} Pending
                </span>
              )}
            </div>

            <div className="max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
              {loadingNotifications && (
                <div className="px-2 py-4 text-[12px] font-medium text-gray-500">
                  Loading notifications...
                </div>
              )}

              {!loadingNotifications && notificationPreview.length === 0 && (
                <div className="px-2 py-4 text-[12px] font-medium text-gray-500">
                  No doctor, clinic, or medical store registrations are waiting right now.
                </div>
              )}

              {!loadingNotifications && notificationPreview.map((application) => (
                <button
                  key={application.id}
                  type="button"
                  onClick={() => navigate(
                    application.type === 'clinic'
                      ? '/admin/users/clinics'
                      : application.type === 'store'
                        ? '/admin/users/stores'
                        : '/admin/users/doctors'
                  )}
                  className="w-full text-left p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <p className="text-[12.5px] font-bold text-gray-900 truncate">
                    {application.name}
                  </p>
                  <p className="text-[12px] text-gray-600 mt-0.5 leading-relaxed">
                    {application.type === 'clinic'
                      ? 'Clinic registered waiting for your response.'
                      : application.type === 'store'
                        ? 'Medical store registered waiting for your response.'
                      : 'Doctor registered waiting for your response.'}
                  </p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const firstPending = notificationPreview[0];

                if (firstPending?.type === 'clinic') {
                  navigate('/admin/users/clinics');
                  return;
                }

                if (firstPending?.type === 'store') {
                  navigate('/admin/users/stores');
                  return;
                }

                navigate('/admin/users/doctors');
              }}
              className="w-full mt-2 text-[12px] font-bold text-[#1EBDB8] py-2 rounded-lg hover:bg-[#1EBDB8]/10 transition-colors"
            >
              View Applications
            </button>
          </div>
        </div>
        
        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl font-bold text-[13px] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>

    </header>
  );
}