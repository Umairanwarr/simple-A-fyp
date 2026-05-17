import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { cancelPatientAppointment, fetchPatientAppointments } from '../../services/authApi';

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

const getLifecycleStatus = (appointment) => {
  const date = String(appointment?.date || '').trim();
  const fromTime = String(appointment?.fromTime || '').trim();
  const toTime = String(appointment?.toTime || '').trim();
  if (!date || !fromTime || !toTime) return 'upcoming';

  const start = new Date(`${date}T${fromTime}:00`);
  const end = new Date(`${date}T${toTime}:00`);
  const now = Date.now();
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return 'upcoming';
  if (now >= start.getTime() && now < end.getTime()) return 'ongoing';
  if (now >= end.getTime()) return 'completed';
  return 'upcoming';
};

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [isCancellingAppointmentId, setIsCancellingAppointmentId] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPatientAppointments = async () => {
      const patientToken = localStorage.getItem('patientToken');

      if (!patientToken) {
        if (isMounted) {
          setAppointments([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchPatientAppointments(patientToken);

        if (!isMounted) {
          return;
        }

        const incomingAppointments = Array.isArray(data?.appointments) ? data.appointments : [];
        setAppointments(incomingAppointments);
      } catch {
        if (isMounted) {
          setAppointments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPatientAppointments();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedAppointments = useMemo(() => {
    const list = Array.isArray(appointments) ? [...appointments] : [];

    list.sort((firstAppointment, secondAppointment) => {
      const firstDateKey = `${firstAppointment?.date || ''} ${firstAppointment?.fromTime || ''}`;
      const secondDateKey = `${secondAppointment?.date || ''} ${secondAppointment?.fromTime || ''}`;
      return firstDateKey.localeCompare(secondDateKey);
    });

    return list;
  }, [appointments]);

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

    const patientToken = localStorage.getItem('patientToken');

    if (!patientToken) {
      toast.error('Session expired. Please sign in again.');
      return;
    }

    try {
      setIsCancellingAppointmentId(String(appointmentToCancel.id));

      const response = await cancelPatientAppointment(patientToken, appointmentToCancel.id, true);

      setAppointments((previousAppointments) => {
        return previousAppointments.filter((appointment) => String(appointment?.id) !== String(appointmentToCancel.id));
      });

      toast.success(response?.message || 'Appointment cancelled successfully.');
      window.dispatchEvent(new Event('patient-appointment-updated'));
      window.dispatchEvent(new Event('doctor-appointment-updated'));
      setAppointmentToCancel(null);
    } catch (error) {
      toast.error(error?.message || 'Could not cancel appointment. Please try again.');
    } finally {
      setIsCancellingAppointmentId('');
    }
  };

  return (
    <div className="flex flex-col mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#1EBDB8] font-bold text-[24px]">Upcoming & Ongoing Appointments</h2>
        <span className="text-[#1EBDB8] font-bold text-[14px]">{sortedAppointments.length} total</span>
      </div>

      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 px-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {isLoading ? (
          <div className="min-w-[85%] sm:min-w-[380px] max-w-[380px] snap-start bg-white rounded-[32px] p-7 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-center h-[320px]">
            <p className="text-[15px] font-semibold text-[#6B7280]">Loading appointments...</p>
          </div>
        ) : null}

        {!isLoading && sortedAppointments.length === 0 ? (
          <div className="min-w-[85%] sm:min-w-[380px] max-w-[380px] snap-start bg-white rounded-[32px] p-7 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-center h-[320px]">
            <p className="text-[15px] font-semibold text-[#6B7280] text-center">
              You do not have any confirmed appointments yet.
            </p>
          </div>
        ) : null}

        {!isLoading && sortedAppointments.map((appt) => (
          (() => {
            const isOngoingAppointment = getLifecycleStatus(appt) === 'ongoing'
              || String(appt?.statusCode || '').trim().toLowerCase() === 'ongoing'
              || String(appt?.status || '').trim().toLowerCase() === 'ongoing';
            const isServiceAppointment = String(appt?.providerType || '').trim().toLowerCase() === 'service';
            const providerTypeLabel = isServiceAppointment
              ? (String(appt?.doctor?.specialization || '').toLowerCase().includes('facility') ? 'Facility Appointment' : 'Lab Appointment')
              : 'Doctor Appointment';
            return (
          <div key={appt.id} className="min-w-[85%] sm:min-w-[380px] max-w-[380px] snap-start bg-white rounded-[32px] p-7 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-[320px]">
            <div>
              <h3 className="text-[#1EBDB8] font-extrabold text-[23px] tracking-tight mb-5">{formatAppointmentDateLabel(appt.date)}</h3>
              <p className="text-[#1F2937] font-extrabold text-[22px] tracking-tight mb-4">{appt.fromTime} - {appt.toTime}</p>
              <p className="text-[#05D182] font-bold text-[18px]">{appt.status}</p>
              <p className="text-[#6B7280] font-bold text-[13px] mt-1">{providerTypeLabel}</p>
              <p className="text-[#6B7280] font-bold text-[14px] mt-2">Fee: {formatAppointmentFee(appt.amountInRupees)}</p>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-[#F3F4F6] border border-gray-100 shrink-0">
                  {isServiceAppointment ? (
                    <div className="w-full h-full flex items-center justify-center text-[#1EBDB8]">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 3H5a2 2 0 0 0-2 2v4" />
                        <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                        <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                        <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                      </svg>
                    </div>
                  ) : (
                    <img src={appt?.doctor?.image || '/topdoc.svg'} alt={appt?.doctor?.name || 'Provider'} className="w-full h-full object-cover object-center" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[#1F2937] font-extrabold text-[16px]">{isServiceAppointment ? appt?.doctor?.name : `Dr. ${appt?.doctor?.name || 'Doctor'}`}</span>
                  <span className="text-[#6B7280] font-medium text-[13px]">Booked Appointment</span>
                </div>
              </div>
              {!isOngoingAppointment && (
                <button
                  type="button"
                  onClick={() => setAppointmentToCancel(appt)}
                  disabled={Boolean(isCancellingAppointmentId)}
                  className="bg-[#FFF1F1] text-[#E11D48] px-4 py-2 rounded-full font-bold text-[13px] border border-[#E11D48]/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCancellingAppointmentId === String(appt.id) ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              )}
            </div>
          </div>
          );
          })()
        ))}
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
              Full refund is available only if you cancel within 15 minutes of booking. After that window, no refund is processed.
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
