import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchDoctorSchedule } from '../../../services/authApi';

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

export default function MySchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

        if (!appointmentDay || !fromTime || !toTime) {
          return null;
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
          bookingStatus: String(appointment?.bookingStatus || '').trim().toLowerCase() === 'cancelled'
            ? 'cancelled'
            : 'confirmed',
          startMinutes,
          endMinutes,
          startHour: Math.floor(startMinutes / 60),
          sortTimestamp: appointmentDay.getTime() + startMinutes
        };
      })
      .filter(Boolean)
      .sort((firstEntry, secondEntry) => firstEntry.sortTimestamp - secondEntry.sortTimestamp);
  }, [appointments]);

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

          <div className="flex items-center gap-3">
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
                              const isCancelled = appointment.bookingStatus === 'cancelled';

                              return (
                                <div
                                  key={appointment.id}
                                  className={`rounded-xl border px-3 py-2.5 shadow-sm ${isCancelled
                                      ? 'bg-[#FEE2E2] border-[#FCA5A5]'
                                      : 'bg-[#DFF4F1] border-[#A7E3DB]'
                                    }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className={`text-[14px] font-bold ${isCancelled ? 'text-[#991B1B]' : 'text-[#1F2432]'}`}>
                                      {appointment.patientName}
                                    </p>
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.08em] ${isCancelled ? 'text-[#B91C1C]' : 'text-[#0F766E]'}`}>
                                      {isCancelled ? 'Cancelled' : 'Booked'}
                                    </span>
                                  </div>

                                  <p className={`text-[11px] mt-1 truncate ${isCancelled ? 'text-[#B45309]' : 'text-[#334155]'}`}>
                                    {appointment.patientEmail}
                                  </p>
                                  <p className={`text-[11px] truncate ${isCancelled ? 'text-[#B45309]' : 'text-[#334155]'}`}>
                                    {appointment.patientPhoneNumber}
                                  </p>
                                  <p className={`text-[11px] font-semibold mt-1 ${isCancelled ? 'text-[#991B1B]' : 'text-[#155E75]'}`}>
                                    {appointment.fromTime} - {appointment.toTime} · {formatModeLabel(appointment.consultationMode)}
                                  </p>
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
    </div>
  );
}
