import React, { useEffect, useMemo, useState } from 'react';
import { fetchPatientAppointmentHistory } from '../../services/authApi';

const formatAppointmentDateLabel = (dateValue) => {
  if (!dateValue) {
    return 'Appointment Date';
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

const getHistoryStatusBadge = (statusCode) => {
  if (statusCode === 'cancelled') {
    return {
      label: 'Cancelled',
      className: 'bg-[#FFF1F2] text-[#E11D48] border border-[#E11D48]/25'
    };
  }

  return {
    label: 'Completed',
    className: 'bg-[#ECFCFB] text-[#0F766E] border border-[#0F766E]/25'
  };
};

export default function AppointmentHistory() {
  const [historyAppointments, setHistoryAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHistoryAppointments = async () => {
      const patientToken = localStorage.getItem('patientToken');

      if (!patientToken) {
        if (isMounted) {
          setHistoryAppointments([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchPatientAppointmentHistory(patientToken);

        if (!isMounted) {
          return;
        }

        const incomingAppointments = Array.isArray(data?.appointments) ? data.appointments : [];
        setHistoryAppointments(incomingAppointments);
      } catch (error) {
        if (isMounted) {
          setHistoryAppointments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHistoryAppointments();

    const refreshHandler = () => {
      loadHistoryAppointments();
    };

    window.addEventListener('patient-appointment-updated', refreshHandler);

    return () => {
      isMounted = false;
      window.removeEventListener('patient-appointment-updated', refreshHandler);
    };
  }, []);

  const sortedHistoryAppointments = useMemo(() => {
    const list = Array.isArray(historyAppointments) ? [...historyAppointments] : [];

    list.sort((firstAppointment, secondAppointment) => {
      const firstKey = String(firstAppointment?.cancelledAt || firstAppointment?.completedAt || firstAppointment?.bookedAt || '');
      const secondKey = String(secondAppointment?.cancelledAt || secondAppointment?.completedAt || secondAppointment?.bookedAt || '');

      return secondKey.localeCompare(firstKey);
    });

    return list;
  }, [historyAppointments]);

  return (
    <div className="flex flex-col gap-4 mb-12">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-[#1EBDB8] font-bold text-[24px]">Appointment History</h2>
        <span className="text-[#1EBDB8] font-bold text-[14px]">{sortedHistoryAppointments.length} total</span>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] text-center">
          <p className="text-[15px] font-semibold text-[#6B7280]">Loading history...</p>
        </div>
      ) : null}

      {!isLoading && sortedHistoryAppointments.length === 0 ? (
        <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] text-center">
          <p className="text-[15px] font-semibold text-[#6B7280]">
            Your cancelled and completed appointments will appear here.
          </p>
        </div>
      ) : null}

      {!isLoading && sortedHistoryAppointments.map((appointment) => {
        const statusBadge = getHistoryStatusBadge(appointment.statusCode);

        return (
          <div
            key={appointment.id}
            className="bg-white rounded-[24px] p-6 sm:p-7 border border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.03)]"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="text-[#1EBDB8] font-extrabold text-[22px] tracking-tight mb-2">
                  {formatAppointmentDateLabel(appointment.date)}
                </h3>
                <p className="text-[#1F2937] font-extrabold text-[20px] tracking-tight mb-2">
                  {appointment.fromTime} - {appointment.toTime}
                </p>
                <p className="text-[#6B7280] font-bold text-[14px]">Fee: {formatAppointmentFee(appointment.amountInRupees)}</p>
              </div>

              <span className={`inline-flex items-center h-fit px-4 py-2 rounded-full text-[13px] font-bold ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
              <div className="w-[52px] h-[52px] bg-transparent shrink-0 flex items-end">
                <img
                  src={appointment.doctor.image}
                  alt={appointment.doctor.name}
                  className="w-[120%] h-[120%] object-contain object-bottom -ml-2"
                />
              </div>
              <div>
                <p className="text-[#1F2937] font-extrabold text-[16px]">{appointment.doctor.name}</p>
                <p className="text-[#6B7280] font-medium text-[13px]">
                  {appointment.statusCode === 'cancelled' ? 'Cancelled Appointment' : 'Completed Appointment'}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
