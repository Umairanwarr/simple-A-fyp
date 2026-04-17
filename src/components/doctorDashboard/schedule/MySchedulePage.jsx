import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  fetchDoctorAvailability,
  fetchDoctorSchedule,
  rescheduleDoctorAppointment
} from '../../../services/authApi';

const DAYS_IN_WEEK = 7;
const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 18;

const formatDateKey = (dateValue) => {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, '0');
  const day = String(dateValue.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseCalendarDate = (rawDate) => {
  const normalizedDate = String(rawDate || '').trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
    return null;
  }

  const parsedDate = new Date(`${normalizedDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const addDays = (dateValue, daysToAdd) => {
  const nextDate = new Date(dateValue);
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  return nextDate;
};

const getWeekStart = (dateValue) => {
  const normalizedDate = new Date(dateValue);
  normalizedDate.setHours(0, 0, 0, 0);
  return addDays(normalizedDate, -normalizedDate.getDay());
};

const toMinutes = (timeValue) => {
  const [hours, minutes] = String(timeValue || '').split(':').map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return (hours * 60) + minutes;
};

const formatMonthLabel = (dateValue) => {
  return dateValue.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
};

const formatDayName = (dateValue) => {
  return dateValue.toLocaleDateString('en-US', {
    weekday: 'short'
  }).toUpperCase();
};

const formatDayDate = (dateValue) => {
  return dateValue.toLocaleDateString('en-US', {
    day: 'numeric'
  });
};

const formatHourLabel = (hourValue) => {
  const dateValue = new Date();
  dateValue.setHours(hourValue, 0, 0, 0);

  return dateValue.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatRangeLabel = (startDate, endDate) => {
  return `${startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })} - ${endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;
};

const getTimezoneLabel = () => {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffset = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteOffset / 60);
  const minutes = absoluteOffset % 60;

  if (minutes === 0) {
    return `GMT ${sign}${hours}`;
  }

  return `GMT ${sign}${hours}:${String(minutes).padStart(2, '0')}`;
};

const formatModeLabel = (modeValue) => {
  return String(modeValue || '').toLowerCase() === 'offline' ? 'Clinic' : 'Online';
};

const getSlotStartTimestamp = ({ date, fromTime }) => {
  const parsedDate = new Date(`${String(date || '').trim()}T${String(fromTime || '').trim()}:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return 0;
  }

  return parsedDate.getTime();
};

const formatScheduleDateLabel = (dateValue) => {
  const parsedDate = new Date(`${String(dateValue || '').trim()}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(dateValue || '').trim();
  }

  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatScheduleSlotLabel = ({ date, fromTime, toTime, consultationMode }) => {
  return `${formatScheduleDateLabel(date)} • ${fromTime} - ${toTime} • ${formatModeLabel(consultationMode)}`;
};

export default function MySchedulePage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [availableRescheduleSlots, setAvailableRescheduleSlots] = useState([]);
  const [selectedRescheduleSlotId, setSelectedRescheduleSlotId] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [isRescheduleSlotsLoading, setIsRescheduleSlotsLoading] = useState(false);
  const [isRescheduleSubmitting, setIsRescheduleSubmitting] = useState(false);

  const weekStartDate = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
  const weekDates = useMemo(() => {
    return Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(weekStartDate, index));
  }, [weekStartDate]);
  const weekEndDate = weekDates[weekDates.length - 1] || weekStartDate;

  const scheduleQuery = useMemo(() => {
    return {
      fromDate: formatDateKey(weekStartDate),
      toDate: formatDateKey(weekEndDate)
    };
  }, [weekStartDate, weekEndDate]);

  const loadSchedule = useCallback(async ({ shouldShowLoading = false, shouldToastError = true } = {}) => {
    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    try {
      if (shouldShowLoading) {
        setIsLoading(true);
      }

      const response = await fetchDoctorSchedule(doctorToken, scheduleQuery);
      const safeAppointments = Array.isArray(response?.appointments) ? response.appointments : [];
      setAppointments(safeAppointments);
    } catch (error) {
      setAppointments([]);

      if (shouldToastError) {
        toast.error(error?.message || 'Could not load schedule appointments');
      }
    } finally {
      if (shouldShowLoading) {
        setIsLoading(false);
      }
    }
  }, [scheduleQuery]);

  useEffect(() => {
    loadSchedule({ shouldShowLoading: true, shouldToastError: true });
  }, [loadSchedule]);

  useEffect(() => {
    const pollId = window.setInterval(() => {
      loadSchedule({ shouldShowLoading: false, shouldToastError: false });
    }, 30000);

    const refreshHandler = () => {
      loadSchedule({ shouldShowLoading: false, shouldToastError: false });
    };

    window.addEventListener('doctor-appointment-updated', refreshHandler);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener('doctor-appointment-updated', refreshHandler);
    };
  }, [loadSchedule]);

  const normalizedAppointments = useMemo(() => {
    return (Array.isArray(appointments) ? appointments : [])
      .map((appointment) => {
        const appointmentDate = String(appointment?.appointmentDate || '').trim();
        const appointmentDay = parseCalendarDate(appointmentDate);
        const fromTime = String(appointment?.fromTime || '').trim();
        const toTime = String(appointment?.toTime || '').trim();
        const startMinutes = toMinutes(fromTime);
        const rawEndMinutes = toMinutes(toTime);
        const endMinutes = rawEndMinutes > startMinutes ? rawEndMinutes : (startMinutes + 30);
        const startTimestamp = appointmentDay.getTime() + (startMinutes * 60 * 1000);
        const endTimestamp = appointmentDay.getTime() + (endMinutes * 60 * 1000);
        const now = Date.now();

        if (!appointmentDay || !fromTime || !toTime) {
          return null;
        }

        const isCancelled = String(appointment?.bookingStatus || '').trim().toLowerCase() === 'cancelled';
        let currentStatus = 'upcoming';
        if (isCancelled) {
          currentStatus = 'cancelled';
        } else if (now >= endTimestamp) {
          currentStatus = 'completed';
        } else if (now >= startTimestamp && now < endTimestamp) {
          currentStatus = 'ongoing';
        }

        return {
          id: String(appointment?.id || ''),
          patientName: String(appointment?.patientName || '').trim() || 'Patient',
          patientEmail: String(appointment?.patientEmail || '').trim() || 'No email',
          patientPhoneNumber: String(appointment?.patientPhoneNumber || '').trim() || 'No phone',
          appointmentDate,
          fromTime,
          toTime,
          consultationMode: String(appointment?.consultationMode || '').trim().toLowerCase() || 'online',
          bookingStatus: isCancelled ? 'cancelled' : 'confirmed',
          currentStatus,
          startMinutes,
          endMinutes,
          startHour: Math.floor(startMinutes / 60),
          startTimestamp,
          sortTimestamp: startTimestamp
        };
      })
      .filter(Boolean)
      .sort((firstEntry, secondEntry) => firstEntry.sortTimestamp - secondEntry.sortTimestamp);
  }, [appointments]);

  const reschedulableAppointments = useMemo(() => {
    const nowTimestamp = Date.now();

    return normalizedAppointments.filter((appointment) => {
      return appointment.bookingStatus !== 'cancelled' && appointment.startTimestamp > nowTimestamp;
    });
  }, [normalizedAppointments]);

  const filteredRescheduleSlots = useMemo(() => {
    const currentSlotSignature = appointmentToReschedule
      ? [
        String(appointmentToReschedule?.appointmentDate || '').trim(),
        String(appointmentToReschedule?.fromTime || '').trim(),
        String(appointmentToReschedule?.toTime || '').trim(),
        String(appointmentToReschedule?.consultationMode || '').trim().toLowerCase() || 'online'
      ].join('|')
      : '';
    const seenSignatures = new Set();

    return availableRescheduleSlots.filter((slot) => {
      const slotSignature = [
        String(slot?.date || '').trim(),
        String(slot?.fromTime || '').trim(),
        String(slot?.toTime || '').trim(),
        String(slot?.consultationMode || '').trim().toLowerCase() || 'online'
      ].join('|');

      if (!slotSignature || slotSignature === currentSlotSignature) {
        return false;
      }

      if (seenSignatures.has(slotSignature)) {
        return false;
      }

      seenSignatures.add(slotSignature);
      return true;
    });
  }, [appointmentToReschedule, availableRescheduleSlots]);

  const defaultHours = useMemo(() => {
    return {
      startHour: DEFAULT_START_HOUR,
      endHour: DEFAULT_END_HOUR
    };
  }, []);

  const hourRange = useMemo(() => {
    if (normalizedAppointments.length === 0) {
      return defaultHours;
    }

    const earliestStartMinutes = Math.min(...normalizedAppointments.map((entry) => entry.startMinutes));
    const latestEndMinutes = Math.max(...normalizedAppointments.map((entry) => entry.endMinutes));
    const dynamicStartHour = Math.floor(earliestStartMinutes / 60);
    const dynamicEndHour = Math.ceil(latestEndMinutes / 60);

    return {
      startHour: Math.min(DEFAULT_START_HOUR, dynamicStartHour),
      endHour: Math.max(DEFAULT_END_HOUR, dynamicEndHour, dynamicStartHour + 1)
    };
  }, [defaultHours, normalizedAppointments]);

  const hourRows = useMemo(() => {
    const rows = [];

    for (let hour = hourRange.startHour; hour < hourRange.endHour; hour += 1) {
      rows.push(hour);
    }

    return rows;
  }, [hourRange]);

  const groupedAppointments = useMemo(() => {
    const groupedMap = new Map();

    normalizedAppointments.forEach((appointment) => {
      const key = `${appointment.appointmentDate}|${appointment.startHour}`;
      const existingAppointments = groupedMap.get(key) || [];
      groupedMap.set(key, [...existingAppointments, appointment]);
    });

    return groupedMap;
  }, [normalizedAppointments]);

  const closeRescheduleModal = useCallback(() => {
    if (isRescheduleSubmitting) {
      return;
    }

    setAppointmentToReschedule(null);
    setAvailableRescheduleSlots([]);
    setSelectedRescheduleSlotId('');
    setRescheduleReason('');
    setIsRescheduleSlotsLoading(false);
  }, [isRescheduleSubmitting]);

  useEffect(() => {
    if (filteredRescheduleSlots.some((slot) => String(slot?.id) === String(selectedRescheduleSlotId))) {
      return;
    }

    setSelectedRescheduleSlotId(filteredRescheduleSlots[0]?.id || '');
  }, [filteredRescheduleSlots, selectedRescheduleSlotId]);

  const openRescheduleModal = useCallback(async (appointment = null) => {
    if (isRescheduleSubmitting || isRescheduleSlotsLoading) {
      return;
    }

    const requestedAppointmentId = String(appointment?.id || '').trim();
    const fallbackAppointment = reschedulableAppointments[0] || null;
    const selectedAppointment = requestedAppointmentId
      ? reschedulableAppointments.find((entry) => String(entry?.id) === requestedAppointmentId) || null
      : fallbackAppointment;

    if (!selectedAppointment) {
      toast.error('No upcoming booked appointments available for rescheduling');
      return;
    }

    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      toast.error('Session expired. Please sign in again.');
      return;
    }

    setAppointmentToReschedule(selectedAppointment);
    setAvailableRescheduleSlots([]);
    setSelectedRescheduleSlotId('');
    setRescheduleReason('');
    setIsRescheduleSlotsLoading(true);

    try {
      const response = await fetchDoctorAvailability(doctorToken);
      const rawSlots = Array.isArray(response?.slots) ? response.slots : [];
      const nowTimestamp = Date.now();

      const futureSlots = rawSlots
        .map((slot) => ({
          id: String(slot?.id || '').trim(),
          date: String(slot?.date || '').trim(),
          fromTime: String(slot?.fromTime || '').trim(),
          toTime: String(slot?.toTime || '').trim(),
          consultationMode: String(slot?.consultationMode || '').trim() || 'online',
          priceInRupees: Math.max(0, Math.trunc(Number(slot?.priceInRupees || 0)))
        }))
        .filter((slot) => {
          if (!slot.id || !slot.date || !slot.fromTime || !slot.toTime) {
            return false;
          }

          return getSlotStartTimestamp({
            date: slot.date,
            fromTime: slot.fromTime
          }) > nowTimestamp;
        })
        .sort((firstSlot, secondSlot) => {
          return getSlotStartTimestamp({
            date: firstSlot.date,
            fromTime: firstSlot.fromTime
          }) - getSlotStartTimestamp({
            date: secondSlot.date,
            fromTime: secondSlot.fromTime
          });
        });

      setAvailableRescheduleSlots(futureSlots);

      if (futureSlots.length > 0) {
        setSelectedRescheduleSlotId(futureSlots[0].id);
      }
    } catch (error) {
      toast.error(error?.message || 'Could not load future slots for rescheduling');
      setAppointmentToReschedule(null);
    } finally {
      setIsRescheduleSlotsLoading(false);
    }
  }, [isRescheduleSlotsLoading, isRescheduleSubmitting, reschedulableAppointments]);

  const handleReschedulePatientChange = useCallback((event) => {
    const nextAppointmentId = String(event?.target?.value || '').trim();

    if (!nextAppointmentId) {
      return;
    }

    const selectedAppointment = reschedulableAppointments.find((entry) => String(entry?.id) === nextAppointmentId);

    if (selectedAppointment) {
      setAppointmentToReschedule(selectedAppointment);
      setSelectedRescheduleSlotId('');
    }
  }, [reschedulableAppointments]);

  const handleAddSlotClick = useCallback(() => {
    closeRescheduleModal();
    navigate('/doctor/dashboard/availability');
  }, [closeRescheduleModal, navigate]);

  const handleConfirmReschedule = useCallback(async () => {
    if (!appointmentToReschedule?.id || isRescheduleSubmitting) {
      return;
    }

    if (!selectedRescheduleSlotId) {
      toast.error('Please select a new slot to reschedule the appointment');
      return;
    }

    const normalizedReason = String(rescheduleReason || '').trim();

    if (normalizedReason.length < 5) {
      toast.error('Please provide a clear reason (minimum 5 characters)');
      return;
    }

    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      toast.error('Session expired. Please sign in again.');
      return;
    }

    try {
      setIsRescheduleSubmitting(true);

      const response = await rescheduleDoctorAppointment(doctorToken, appointmentToReschedule.id, {
        newSlotId: selectedRescheduleSlotId,
        reason: normalizedReason
      });

      toast.success(response?.message || 'Appointment rescheduled successfully');
      closeRescheduleModal();
      await loadSchedule({ shouldShowLoading: false, shouldToastError: false });
      window.dispatchEvent(new Event('doctor-appointment-updated'));
      window.dispatchEvent(new Event('patient-appointment-updated'));
    } catch (error) {
      toast.error(error?.message || 'Could not reschedule appointment');
    } finally {
      setIsRescheduleSubmitting(false);
    }
  }, [
    appointmentToReschedule,
    closeRescheduleModal,
    isRescheduleSubmitting,
    loadSchedule,
    rescheduleReason,
    selectedRescheduleSlotId
  ]);

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2 bg-[#FCFCFD]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1EBDB8]">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>

            <span className="text-[24px] font-bold text-[#1EBDB8]">{formatMonthLabel(weekStartDate)}</span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelectedDate((previousDate) => addDays(getWeekStart(previousDate), -7))}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Previous week"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate((previousDate) => addDays(getWeekStart(previousDate), 7))}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Next week"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => openRescheduleModal()}
              disabled={
                isLoading
                || isRescheduleSubmitting
                || isRescheduleSlotsLoading
                || reschedulableAppointments.length === 0
              }
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl border border-[#1EBDB8]/30 bg-[#ECFEFF] text-[#0F766E] text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#CFFAFE] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Reschedule
            </button>
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.1em]">My Schedule</span>
            <span className="text-[13px] font-semibold text-[#4B5563]">{formatRangeLabel(weekStartDate, weekEndDate)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden w-full min-w-0">
        {isLoading ? (
          <div className="px-6 py-10 text-center text-[14px] font-medium text-gray-500">
            Loading your schedule...
          </div>
        ) : (
          <div className="overflow-x-auto w-full custom-scrollbar">
            <div className="min-w-[1080px]">
              <div
                className="grid border-b border-gray-200"
                style={{ gridTemplateColumns: '84px repeat(7, minmax(130px, 1fr))' }}
              >
                <div className="px-3 py-3 text-[18px] font-bold text-[#4B5563] border-r border-gray-200">{getTimezoneLabel()}</div>
                {weekDates.map((dayDate) => {
                  const isToday = formatDateKey(dayDate) === formatDateKey(new Date());

                  return (
                    <div key={formatDateKey(dayDate)} className="px-3 py-3 border-r border-gray-200 last:border-r-0 text-center">
                      <p className="text-[12px] font-bold text-gray-600">{formatDayName(dayDate)}</p>
                      {isToday ? (
                        <span className="inline-flex mt-2 w-7 h-7 rounded-full bg-[#1EBDB8] text-white text-[12px] font-bold items-center justify-center">
                          {formatDayDate(dayDate)}
                        </span>
                      ) : (
                        <p className="text-[22px] leading-none font-medium text-[#1F2432] mt-1">{formatDayDate(dayDate)}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {hourRows.map((hour) => (
                <div
                  key={`hour-${hour}`}
                  className="grid border-b border-gray-200 last:border-b-0"
                  style={{ gridTemplateColumns: '84px repeat(7, minmax(130px, 1fr))' }}
                >
                  <div className="px-3 py-4 border-r border-gray-200 text-[14px] font-bold text-gray-500 whitespace-nowrap">
                    {formatHourLabel(hour)}
                  </div>

                  {weekDates.map((dayDate) => {
                    const dayKey = formatDateKey(dayDate);
                    const slotKey = `${dayKey}|${hour}`;
                    const slotAppointments = groupedAppointments.get(slotKey) || [];

                    return (
                      <div
                        key={`${slotKey}-cell`}
                        className="min-h-[112px] p-2.5 border-r border-gray-200 last:border-r-0 bg-[#FCFCFD]"
                      >
                        {slotAppointments.length === 0 ? (
                          <div className="h-full min-h-[95px] rounded-xl border border-dashed border-gray-200 bg-white/70"></div>
                        ) : (
                          <div className="space-y-2">
                            {slotAppointments.map((appointment) => {
                              const isCancelled = appointment.currentStatus === 'cancelled';
                              const isOngoing = appointment.currentStatus === 'ongoing';
                              const isCompleted = appointment.currentStatus === 'completed';
                              const isUpcoming = appointment.currentStatus === 'upcoming';
                              const canRescheduleAppointment = isUpcoming;

                              let bgClass = 'bg-[#DFF4F1] border-[#A7E3DB]';
                              let badgeTextClass = 'text-[#0F766E]';
                              let label = 'Upcoming';
                              let titleClass = 'text-[#1F2432]';
                              let textClass1 = 'text-[#334155]';
                              let textClass2 = 'text-[#155E75]';

                              if (isCancelled) {
                                bgClass = 'bg-[#FEE2E2] border-[#FCA5A5]';
                                badgeTextClass = 'text-[#B91C1C]';
                                label = 'Cancelled';
                                titleClass = 'text-[#991B1B]';
                                textClass1 = 'text-[#B45309]';
                                textClass2 = 'text-[#991B1B]';
                              } else if (isOngoing) {
                                bgClass = 'bg-[#DCFCE7] border-[#86EFAC]';
                                badgeTextClass = 'text-[#166534]';
                                label = 'Ongoing';
                                titleClass = 'text-[#14532D]';
                                textClass1 = 'text-[#166534]';
                                textClass2 = 'text-[#14532D]';
                              } else if (isCompleted) {
                                bgClass = 'bg-[#F3F4F6] border-[#D1D5DB]';
                                badgeTextClass = 'text-[#4B5563]';
                                label = 'Completed';
                                titleClass = 'text-[#374151]';
                                textClass1 = 'text-[#6B7280]';
                                textClass2 = 'text-[#4B5563]';
                              }

                              return (
                                <div
                                  key={appointment.id}
                                  className={`rounded-xl border px-3 py-2.5 shadow-sm ${bgClass}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className={`text-[14px] font-bold ${titleClass}`}>
                                      {appointment.patientName}
                                    </p>
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.08em] ${badgeTextClass}`}>
                                      {label}
                                    </span>
                                  </div>

                                  <p className={`text-[11px] mt-1 truncate ${textClass1}`}>
                                    {appointment.patientEmail}
                                  </p>
                                  <p className={`text-[11px] truncate ${textClass1}`}>
                                    {appointment.patientPhoneNumber}
                                  </p>
                                  <p className={`text-[11px] font-semibold mt-1 ${textClass2}`}>
                                    {appointment.fromTime} - {appointment.toTime} · {formatModeLabel(appointment.consultationMode)}
                                  </p>

                                  {canRescheduleAppointment ? (
                                    <div className="pt-2">
                                      <button
                                        type="button"
                                        onClick={() => openRescheduleModal(appointment)}
                                        disabled={isRescheduleSubmitting || isRescheduleSlotsLoading}
                                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-white border border-[#1EBDB8]/50 text-[#0F766E] text-[10px] font-bold uppercase tracking-[0.06em] hover:bg-[#ECFEFF] disabled:opacity-60 disabled:cursor-not-allowed"
                                      >
                                        Reschedule
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {appointmentToReschedule ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-2 sm:px-4 py-3 sm:py-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={closeRescheduleModal}
            disabled={isRescheduleSubmitting}
            aria-label="Close reschedule modal"
          />

          <div className="relative w-full max-w-[680px] max-h-[92vh] overflow-y-auto rounded-[28px] bg-white p-5 sm:p-7 shadow-[0px_20px_50px_rgba(0,0,0,0.2)] border border-gray-100">
            <h3 className="text-[#111827] text-[24px] font-extrabold tracking-tight">Reschedule Appointment</h3>
            <p className="mt-2 text-[#4B5563] text-[14px] leading-relaxed">
              Select a new slot and provide a reason. The patient will be notified by both app notification and email.
            </p>

            <div className="mt-5 space-y-3">
              <div className="space-y-2">
                <label htmlFor="reschedule-patient" className="text-[14px] font-semibold text-[#1F2432]">Patient Appointment</label>
                <select
                  id="reschedule-patient"
                  value={String(appointmentToReschedule?.id || '')}
                  onChange={handleReschedulePatientChange}
                  disabled={isRescheduleSubmitting || reschedulableAppointments.length === 0}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20 disabled:opacity-60"
                >
                  {reschedulableAppointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {`${appointment.patientName} • ${formatScheduleSlotLabel({
                        date: appointment.appointmentDate,
                        fromTime: appointment.fromTime,
                        toTime: appointment.toTime,
                        consultationMode: appointment.consultationMode
                      })}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-4 space-y-2">
                <p className="text-[13px] text-[#6B7280] font-semibold uppercase tracking-[0.08em]">Selected Patient</p>
                <p className="text-[16px] font-bold text-[#1F2432]">{appointmentToReschedule.patientName}</p>
                <p className="text-[13px] text-[#4B5563]">{appointmentToReschedule.patientEmail}</p>
                <p className="text-[13px] text-[#4B5563]">Current Slot: {
                  formatScheduleSlotLabel({
                    date: appointmentToReschedule.appointmentDate,
                    fromTime: appointmentToReschedule.fromTime,
                    toTime: appointmentToReschedule.toTime,
                    consultationMode: appointmentToReschedule.consultationMode
                  })
                }</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label htmlFor="reschedule-slot" className="text-[14px] font-semibold text-[#1F2432]">New Slot</label>

                {isRescheduleSlotsLoading ? (
                  <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-3 text-[13px] text-[#6B7280] font-medium">
                    Loading available future slots...
                  </div>
                ) : filteredRescheduleSlots.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 font-medium">
                    <p>No alternative slots are available for this patient right now.</p>
                    <button
                      type="button"
                      onClick={handleAddSlotClick}
                      className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-amber-600 text-white text-[12px] font-semibold hover:bg-amber-700 transition-colors"
                    >
                      Add Slot
                    </button>
                  </div>
                ) : (
                  <select
                    id="reschedule-slot"
                    value={selectedRescheduleSlotId}
                    onChange={(event) => setSelectedRescheduleSlotId(String(event?.target?.value || ''))}
                    disabled={isRescheduleSubmitting}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20 disabled:opacity-60"
                  >
                    {filteredRescheduleSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {`${formatScheduleSlotLabel({
                          date: slot.date,
                          fromTime: slot.fromTime,
                          toTime: slot.toTime,
                          consultationMode: slot.consultationMode
                        })}`}
                      </option>
                    ))}
                  </select>
                )}

                <p className="text-[12px] text-[#6B7280]">
                  Patient keeps the original paid fee. Selecting a higher-priced slot does not charge extra.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="reschedule-reason" className="text-[14px] font-semibold text-[#1F2432]">Reason</label>
                <textarea
                  id="reschedule-reason"
                  value={rescheduleReason}
                  onChange={(event) => setRescheduleReason(String(event?.target?.value || '').slice(0, 500))}
                  placeholder="Enter reason for rescheduling"
                  disabled={isRescheduleSubmitting}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20 disabled:opacity-60"
                />
                <p className="text-[12px] text-[#6B7280]">Minimum 5 characters.</p>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeRescheduleModal}
                disabled={isRescheduleSubmitting}
                className="px-4 py-2 rounded-full border border-gray-300 text-[#374151] text-[14px] font-semibold transition hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={isRescheduleSubmitting || isRescheduleSlotsLoading}
                className="px-4 py-2 rounded-full bg-[#1EBDB8] text-white text-[14px] font-semibold transition hover:bg-[#0FAAA7] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRescheduleSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
