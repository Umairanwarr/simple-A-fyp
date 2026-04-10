import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  cancelDoctorUpcomingAppointment,
  fetchDoctorAppointments
} from '../../../services/authApi';

const formatAppointmentDateLabel = (dateValue) => {
  if (!dateValue) {
    return 'Upcoming Appointment';
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

const formatAppointmentFee = (amountInRupees) => {
  const parsedAmount = Number(amountInRupees);
  const normalizedAmount = Number.isFinite(parsedAmount)
    ? Math.max(0, parsedAmount)
    : 0;

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(normalizedAmount);
};

const sortAppointmentsByDate = (appointments) => {
  const safeAppointments = Array.isArray(appointments) ? [...appointments] : [];

  safeAppointments.sort((firstAppointment, secondAppointment) => {
    const firstDateKey = `${firstAppointment?.date || ''} ${firstAppointment?.fromTime || ''}`;
    const secondDateKey = `${secondAppointment?.date || ''} ${secondAppointment?.fromTime || ''}`;
    return firstDateKey.localeCompare(secondDateKey);
  });

  return safeAppointments;
};

export default function AppointmentsPage() {
  const [activeSection, setActiveSection] = useState('upcoming');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [ongoingAppointments, setOngoingAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isCancellingAppointmentId, setIsCancellingAppointmentId] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDoctorAppointments = async ({ shouldShowLoading = true } = {}) => {
      const doctorToken = localStorage.getItem('doctorToken');

      if (!doctorToken) {
        if (isMounted) {
          setUpcomingAppointments([]);
          setOngoingAppointments([]);
          setCancelledAppointments([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        if (shouldShowLoading && isMounted) {
          setIsLoading(true);
        }

        const data = await fetchDoctorAppointments(doctorToken);

        if (!isMounted) {
          return;
        }

        setUpcomingAppointments(Array.isArray(data?.upcomingAppointments) ? data.upcomingAppointments : []);
        setOngoingAppointments(Array.isArray(data?.ongoingAppointments) ? data.ongoingAppointments : []);
        setCancelledAppointments(Array.isArray(data?.cancelledAppointments) ? data.cancelledAppointments : []);
      } catch (error) {
        if (isMounted) {
          setUpcomingAppointments([]);
          setOngoingAppointments([]);
          setCancelledAppointments([]);

          if (shouldShowLoading) {
            toast.error(error?.message || 'Could not load appointments');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDoctorAppointments({ shouldShowLoading: true });

    const pollingIntervalId = window.setInterval(() => {
      loadDoctorAppointments({ shouldShowLoading: false });
    }, 30000);

    const refreshHandler = () => {
      loadDoctorAppointments({ shouldShowLoading: false });
    };

    window.addEventListener('doctor-appointment-updated', refreshHandler);

    return () => {
      isMounted = false;
      window.clearInterval(pollingIntervalId);
      window.removeEventListener('doctor-appointment-updated', refreshHandler);
    };
  }, []);

  const sortedUpcomingAppointments = useMemo(() => {
    return sortAppointmentsByDate(upcomingAppointments);
  }, [upcomingAppointments]);

  const sortedOngoingAppointments = useMemo(() => {
    return sortAppointmentsByDate(ongoingAppointments);
  }, [ongoingAppointments]);

  const sortedCancelledAppointments = useMemo(() => {
    const safeAppointments = Array.isArray(cancelledAppointments) ? [...cancelledAppointments] : [];

    safeAppointments.sort((firstAppointment, secondAppointment) => {
      const firstKey = String(firstAppointment?.cancelledAt || firstAppointment?.date || '');
      const secondKey = String(secondAppointment?.cancelledAt || secondAppointment?.date || '');

      return secondKey.localeCompare(firstKey);
    });

    return safeAppointments;
  }, [cancelledAppointments]);

  const visibleAppointments = activeSection === 'ongoing'
    ? sortedOngoingAppointments
    : activeSection === 'cancelled'
      ? sortedCancelledAppointments
      : sortedUpcomingAppointments;

  const closeCancelModal = () => {
    if (isCancellingAppointmentId) {
      return;
    }

    setAppointmentToCancel(null);
  };

  const handleConfirmCancelAppointment = async () => {
    if (!appointmentToCancel?.id || isCancellingAppointmentId) {
      return;
    }

    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      toast.error('Session expired. Please sign in again.');
      return;
    }

    try {
      setIsCancellingAppointmentId(String(appointmentToCancel.id));

      const response = await cancelDoctorUpcomingAppointment(doctorToken, appointmentToCancel.id);

      setUpcomingAppointments((previousAppointments) => {
        return previousAppointments.filter((appointment) => String(appointment?.id) !== String(appointmentToCancel.id));
      });

      toast.success(response?.message || 'Appointment cancelled successfully.');
      window.dispatchEvent(new Event('doctor-appointment-updated'));
      window.dispatchEvent(new Event('patient-appointment-updated'));
      setAppointmentToCancel(null);
    } catch (error) {
      toast.error(error?.message || 'Could not cancel appointment. Please try again.');
    } finally {
      setIsCancellingAppointmentId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-[26px] leading-tight font-bold text-[#1F2432]">Appointments</h2>
            <p className="text-[14px] text-[#6B7280] mt-1">Track upcoming and ongoing appointments with your patients.</p>
          </div>

          <div className="inline-flex items-center p-1.5 rounded-[16px] bg-[#F4F7FB] border border-gray-100 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveSection('upcoming')}
              className={`px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition w-full md:w-auto ${
                activeSection === 'upcoming'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Upcoming ({sortedUpcomingAppointments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('ongoing')}
              className={`px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition w-full md:w-auto ${
                activeSection === 'ongoing'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Ongoing ({sortedOngoingAppointments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('cancelled')}
              className={`px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition w-full md:w-auto ${
                activeSection === 'cancelled'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              Cancelled ({sortedCancelledAppointments.length})
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
        {isLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-[#6B7280]">Loading appointments...</p>
          </div>
        ) : null}

        {!isLoading && visibleAppointments.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-[#6B7280]">
              {activeSection === 'ongoing'
                ? 'No ongoing appointments right now.'
                : activeSection === 'cancelled'
                  ? 'No cancelled appointments yet.'
                  : 'No upcoming appointments available.'}
            </p>
          </div>
        ) : null}

        {!isLoading && visibleAppointments.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {visibleAppointments.map((appointment) => {
              const isOngoing = activeSection === 'ongoing';
              const isCancelled = activeSection === 'cancelled';
              const canCancelAppointment = activeSection === 'upcoming';

              return (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-gray-100 bg-[#FCFCFD] p-5 shadow-sm flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.08em] font-bold text-[#9CA3AF]">
                        {formatAppointmentDateLabel(appointment.date)}
                      </p>
                      <h3 className="mt-1 text-[20px] font-bold text-[#1F2432]">
                        {appointment.fromTime} - {appointment.toTime}
                      </h3>
                    </div>

                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] ${
                      isCancelled
                        ? 'bg-[#FEE2E2] text-[#991B1B]'
                        : isOngoing
                        ? 'bg-[#DCFCE7] text-[#166534]'
                        : 'bg-[#DBEAFE] text-[#1D4ED8]'
                    }`}>
                      {isCancelled ? 'Cancelled' : isOngoing ? 'Ongoing' : 'Upcoming'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[16px] font-bold text-[#111827]">{appointment.patient?.name || 'Patient'}</p>
                    <p className="text-[13px] text-[#4B5563]">{appointment.patient?.email || 'N/A'}</p>
                    <p className="text-[13px] text-[#4B5563]">{appointment.patient?.phoneNumber || 'N/A'}</p>
                    <p className="text-[13px] font-semibold text-[#0F766E]">
                      {appointment.consultationMode === 'offline' ? 'Clinic Visit' : 'Online Consultation'}
                    </p>
                    <p className="text-[13px] font-semibold text-[#6B7280]">
                      Slot Price: {formatAppointmentFee(appointment.amountInRupees)}
                    </p>
                  </div>

                  {canCancelAppointment ? (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setAppointmentToCancel(appointment)}
                        disabled={Boolean(isCancellingAppointmentId)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#FFF1F1] border border-[#E11D48]/30 text-[#E11D48] text-[13px] font-bold transition hover:bg-[#FFE4E6] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isCancellingAppointmentId === String(appointment.id) ? 'Cancelling...' : 'Cancel Appointment'}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {appointmentToCancel ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={closeCancelModal}
            disabled={Boolean(isCancellingAppointmentId)}
            aria-label="Close cancel appointment confirmation"
          />

          <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 sm:p-7 shadow-[0px_20px_50px_rgba(0,0,0,0.2)] border border-gray-100">
            <h3 className="text-[#111827] text-[22px] font-extrabold tracking-tight">Cancel Appointment?</h3>
            <p className="mt-3 text-[#4B5563] text-[15px] leading-relaxed">
              Patient will get refund and your payout for this appointment will become Rs 0. Admin commission will be retained.
            </p>

            <div className="mt-7 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeCancelModal}
                disabled={Boolean(isCancellingAppointmentId)}
                className="px-4 py-2 rounded-full border border-gray-300 text-[#374151] text-[14px] font-semibold transition hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Keep Appointment
              </button>

              <button
                type="button"
                onClick={handleConfirmCancelAppointment}
                disabled={Boolean(isCancellingAppointmentId)}
                className="px-4 py-2 rounded-full bg-[#E11D48] text-white text-[14px] font-semibold transition hover:bg-[#be123c] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCancellingAppointmentId ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
