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
      } catch (error) {
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

      toast.success(response?.message || 'Appointment cancelled. No refund will be processed.');
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
        <h2 className="text-[#1EBDB8] font-bold text-[24px]">Upcoming Appointments</h2>
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
          <div key={appt.id} className="min-w-[85%] sm:min-w-[380px] max-w-[380px] snap-start bg-white rounded-[32px] p-7 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between h-[320px]">
            <div>
              <h3 className="text-[#1EBDB8] font-extrabold text-[23px] tracking-tight mb-5">{formatAppointmentDateLabel(appt.date)}</h3>
              <p className="text-[#1F2937] font-extrabold text-[22px] tracking-tight mb-4">{appt.fromTime} - {appt.toTime}</p>
              <p className="text-[#05D182] font-bold text-[18px]">{appt.status}</p>
              <p className="text-[#6B7280] font-bold text-[14px] mt-2">Fee: {formatAppointmentFee(appt.amountInRupees)}</p>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <div className="w-[52px] h-[52px] bg-transparent shrink-0 flex items-end">
                  <img src={appt.doctor.image} alt={appt.doctor.name} className="w-[120%] h-[120%] object-contain object-bottom -ml-2" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#1F2937] font-extrabold text-[16px]">{appt.doctor.name}</span>
                  <span className="text-[#6B7280] font-medium text-[13px]">Booked Appointment</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAppointmentToCancel(appt)}
                disabled={Boolean(isCancellingAppointmentId)}
                className="bg-[#FFF1F1] text-[#E11D48] px-4 py-2 rounded-full font-bold text-[13px] border border-[#E11D48]/30 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCancellingAppointmentId === String(appt.id) ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
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
              If you cancel this appointment, you will not get refund.
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
