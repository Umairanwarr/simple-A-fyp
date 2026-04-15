import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchDoctorAppointments } from '../../services/authApi';

const formatTimeRange = (fromTime, toTime) => {
  const safeFromTime = String(fromTime || '').trim();
  const safeToTime = String(toTime || '').trim();

  if (!safeFromTime || !safeToTime) {
    return 'Time unavailable';
  }

  return `${safeFromTime} - ${safeToTime}`;
};

export default function VirtualClinic() {
  const [ongoingAppointments, setOngoingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadOngoingAppointments = async ({ shouldShowLoading = true, shouldToastError = true } = {}) => {
      const doctorToken = localStorage.getItem('doctorToken');

      if (!doctorToken) {
        if (isMounted) {
          setOngoingAppointments([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        if (shouldShowLoading && isMounted) {
          setIsLoading(true);
        }

        const response = await fetchDoctorAppointments(doctorToken);

        if (!isMounted) {
          return;
        }

        const incomingOngoingAppointments = Array.isArray(response?.ongoingAppointments)
          ? response.ongoingAppointments
          : [];

        setOngoingAppointments(incomingOngoingAppointments);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setOngoingAppointments([]);

        if (shouldToastError) {
          toast.error(error?.message || 'Could not load ongoing appointments');
        }
      } finally {
        if (shouldShowLoading && isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOngoingAppointments({ shouldShowLoading: true, shouldToastError: true });

    const intervalId = window.setInterval(() => {
      loadOngoingAppointments({ shouldShowLoading: false, shouldToastError: false });
    }, 30000);

    const refreshHandler = () => {
      loadOngoingAppointments({ shouldShowLoading: false, shouldToastError: false });
    };

    window.addEventListener('doctor-appointment-updated', refreshHandler);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('doctor-appointment-updated', refreshHandler);
    };
  }, []);

  const sortedOngoingAppointments = useMemo(() => {
    const safeAppointments = Array.isArray(ongoingAppointments) ? [...ongoingAppointments] : [];

    safeAppointments.sort((firstAppointment, secondAppointment) => {
      const firstKey = `${String(firstAppointment?.date || '').trim()} ${String(firstAppointment?.fromTime || '').trim()}`;
      const secondKey = `${String(secondAppointment?.date || '').trim()} ${String(secondAppointment?.fromTime || '').trim()}`;

      return firstKey.localeCompare(secondKey);
    });

    return safeAppointments;
  }, [ongoingAppointments]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[#1F2432]">Today's Appointments</h3>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-[14px] font-semibold text-[#6B7280]">Loading ongoing appointments...</p>
            </div>
          ) : null}

          {!isLoading && sortedOngoingAppointments.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
              <p className="text-[14px] font-semibold text-[#6B7280]">No ongoing appointments right now.</p>
            </div>
          ) : null}

          {!isLoading && sortedOngoingAppointments.map((appointment) => {
            const avatarUrl = String(appointment?.patient?.avatarUrl || '').trim();

            return (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#1EBDB8]/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-[#1EBDB8]/10 rounded-full flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={appointment?.patient?.name || 'Patient profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">👤</span>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500"></div>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#1F2432]">{appointment?.patient?.name || 'Patient'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[14px] font-bold text-[#1F2432]">{formatTimeRange(appointment?.fromTime, appointment?.toTime)}</p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#1EBDB8] text-white text-[12px] font-bold rounded-xl hover:bg-[#1CAAAE]"
                    onClick={() => {
                      const partnerId = String(appointment?.patient?.id || '').trim();
                      if (!partnerId) {
                        toast.error('Unable to open chat for this patient');
                        return;
                      }

                      navigate(`/doctor/dashboard/chats?partnerId=${encodeURIComponent(partnerId)}`);
                    }}
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
