import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  fetchClinicAppointments,
  fetchClinicDoctors,
  fetchClinicDoctorAvailability,
  fetchClinicServiceAvailability,
  rescheduleClinicAppointment
} from '../../services/authApi';

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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) return null;

  const parsedDate = new Date(`${normalizedDate}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
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
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
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
  const normalizedMode = String(modeValue || '').toLowerCase();
  if (normalizedMode === 'offline') return 'Clinic';
  if (normalizedMode === 'video') return 'Video';
  return 'Online';
};

const getAppointmentStatus = ({ statusCode, date, fromTime, toTime }) => {
  const normalizedStatus = String(statusCode || '').trim().toLowerCase();
  if (normalizedStatus === 'cancelled') return 'cancelled';
  if (normalizedStatus === 'ongoing') return 'ongoing';
  if (normalizedStatus === 'completed') return 'completed';

  const appointmentDay = parseCalendarDate(date);
  if (!appointmentDay) return normalizedStatus || 'upcoming';

  const startMinutes = toMinutes(fromTime);
  const rawEndMinutes = toMinutes(toTime);
  const endMinutes = rawEndMinutes > startMinutes ? rawEndMinutes : startMinutes + 30;
  const startTimestamp = appointmentDay.getTime() + (startMinutes * 60 * 1000);
  const endTimestamp = appointmentDay.getTime() + (endMinutes * 60 * 1000);
  const now = Date.now();

  if (now >= endTimestamp) return 'completed';
  if (now >= startTimestamp && now < endTimestamp) return 'ongoing';
  return 'upcoming';
};

export default function ClinicSchedule() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reschedule state
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [availableRescheduleSlots, setAvailableRescheduleSlots] = useState([]);
  const [isRescheduleSlotsLoading, setIsRescheduleSlotsLoading] = useState(false);
  const [selectedRescheduleSlotId, setSelectedRescheduleSlotId] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [isRescheduleSubmitting, setIsRescheduleSubmitting] = useState(false);

  const weekStartDate = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
  const weekDates = useMemo(() => {
    return Array.from({ length: DAYS_IN_WEEK }, (_, index) => addDays(weekStartDate, index));
  }, [weekStartDate]);
  const weekEndDate = weekDates[weekDates.length - 1] || weekStartDate;

  const loadSchedule = useCallback(async ({ shouldShowLoading = false, shouldToastError = true } = {}) => {
    const clinicToken = localStorage.getItem('clinicToken');
    if (!clinicToken) {
      setDoctors([]);
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    try {
      if (shouldShowLoading) {
        setIsLoading(true);
      }

      const [doctorResponse, appointmentResponse] = await Promise.all([
        fetchClinicDoctors(clinicToken),
        fetchClinicAppointments(clinicToken)
      ]);

      const safeDoctors = Array.isArray(doctorResponse?.doctors) ? doctorResponse.doctors : [];
      const mergedAppointments = [
        ...(Array.isArray(appointmentResponse?.upcomingAppointments) ? appointmentResponse.upcomingAppointments : []),
        ...(Array.isArray(appointmentResponse?.ongoingAppointments) ? appointmentResponse.ongoingAppointments : []),
        ...(Array.isArray(appointmentResponse?.cancelledAppointments) ? appointmentResponse.cancelledAppointments : [])
      ];

      setDoctors(safeDoctors);
      setAppointments(mergedAppointments);
    } catch (error) {
      setDoctors([]);
      setAppointments([]);

      if (shouldToastError) {
        toast.error(error?.message || 'Could not load clinic schedule');
      }
    } finally {
      if (shouldShowLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadSchedule({ shouldShowLoading: true, shouldToastError: true });
  }, [loadSchedule]);

  useEffect(() => {
    const refreshHandler = () => {
      loadSchedule({ shouldShowLoading: false, shouldToastError: false });
    };

    window.addEventListener('clinic-appointments-updated', refreshHandler);
    return () => window.removeEventListener('clinic-appointments-updated', refreshHandler);
  }, [loadSchedule]);

  const doctorById = useMemo(() => {
    const doctorMap = new Map();
    doctors.forEach((doctor) => {
      doctorMap.set(String(doctor?.id || ''), doctor);
    });
    return doctorMap;
  }, [doctors]);

  const normalizedAppointments = useMemo(() => {
    return appointments
      .map((appointment) => {
        const appointmentDate = String(appointment?.date || appointment?.appointmentDate || '').trim();
        const appointmentDay = parseCalendarDate(appointmentDate);
        const fromTime = String(appointment?.fromTime || '').trim();
        const toTime = String(appointment?.toTime || '').trim();

        if (!appointmentDay || !fromTime || !toTime) {
          return null;
        }

        const doctorId = String(appointment?.doctor?.id || appointment?.doctorId || '').trim();
        const providerType = String(appointment?.providerType || '').trim().toLowerCase() === 'service' ? 'service' : 'doctor';
        const providerId = providerType === 'service'
          ? String(appointment?.serviceId || appointment?.doctor?.id || appointment?.doctorId || '').trim()
          : doctorId;
        const doctor = doctorById.get(doctorId);
        const startMinutes = toMinutes(fromTime);
        const rawEndMinutes = toMinutes(toTime);
        const endMinutes = rawEndMinutes > startMinutes ? rawEndMinutes : startMinutes + 30;
        const startTimestamp = appointmentDay.getTime() + (startMinutes * 60 * 1000);

        return {
          id: String(appointment?.id || ''),
          doctorId,
          providerType,
          serviceType: String(appointment?.serviceType || '').trim().toLowerCase() === 'facility' ? 'facility' : (providerType === 'service' ? 'lab' : ''),
          providerId,
          doctorName: String(appointment?.doctor?.name || doctor?.fullName || '').trim() || 'Clinic Doctor',
          doctorSpecialization: String(appointment?.doctor?.specialization || doctor?.specialization || '').trim() || 'Consultant',
          patientName: String(appointment?.patientName || '').trim() || 'Patient',
          patientPhone: String(appointment?.patientPhone || '').trim() || 'No phone',
          appointmentDate,
          fromTime,
          toTime,
          consultationMode: String(appointment?.consultationMode || '').trim().toLowerCase() || 'online',
          currentStatus: getAppointmentStatus({
            statusCode: appointment?.statusCode,
            date: appointmentDate,
            fromTime,
            toTime
          }),
          startMinutes,
          endMinutes,
          startHour: Math.floor(startMinutes / 60),
          sortTimestamp: startTimestamp
        };
      })
      .filter(Boolean)
      .filter((appointment) => {
        const matchesDoctor = selectedDoctorId === 'all' || String(appointment.doctorId) === String(selectedDoctorId);
        const matchesProvider = selectedProviderFilter === 'all'
          || (selectedProviderFilter === 'doctor' && appointment.providerType === 'doctor')
          || (selectedProviderFilter === 'lab' && appointment.providerType === 'service' && appointment.serviceType === 'lab')
          || (selectedProviderFilter === 'facility' && appointment.providerType === 'service' && appointment.serviceType === 'facility');
        return matchesDoctor && matchesProvider;
      })
      .sort((firstEntry, secondEntry) => firstEntry.sortTimestamp - secondEntry.sortTimestamp);
  }, [appointments, doctorById, selectedDoctorId, selectedProviderFilter]);

  const weekAppointments = useMemo(() => {
    const fromKey = formatDateKey(weekStartDate);
    const toKey = formatDateKey(weekEndDate);

    return normalizedAppointments.filter((appointment) => {
      return appointment.appointmentDate >= fromKey && appointment.appointmentDate <= toKey;
    });
  }, [normalizedAppointments, weekEndDate, weekStartDate]);

  const hourRange = useMemo(() => {
    if (weekAppointments.length === 0) {
      return {
        startHour: DEFAULT_START_HOUR,
        endHour: DEFAULT_END_HOUR
      };
    }

    const earliestStartMinutes = Math.min(...weekAppointments.map((entry) => entry.startMinutes));
    const latestEndMinutes = Math.max(...weekAppointments.map((entry) => entry.endMinutes));
    const dynamicStartHour = Math.floor(earliestStartMinutes / 60);
    const dynamicEndHour = Math.ceil(latestEndMinutes / 60);

    return {
      startHour: Math.min(DEFAULT_START_HOUR, dynamicStartHour),
      endHour: Math.max(DEFAULT_END_HOUR, dynamicEndHour, dynamicStartHour + 1)
    };
  }, [weekAppointments]);

  const hourRows = useMemo(() => {
    const rows = [];
    for (let hour = hourRange.startHour; hour < hourRange.endHour; hour += 1) {
      rows.push(hour);
    }
    return rows;
  }, [hourRange]);

  const groupedAppointments = useMemo(() => {
    const groupedMap = new Map();

    weekAppointments.forEach((appointment) => {
      const key = `${appointment.appointmentDate}|${appointment.startHour}`;
      const existingAppointments = groupedMap.get(key) || [];
      groupedMap.set(key, [...existingAppointments, appointment]);
    });

    return groupedMap;
  }, [weekAppointments]);

  const reschedulableAppointments = useMemo(() => {
    const nowTimestamp = Date.now();
    return normalizedAppointments.filter((appointment) => {
      return appointment.currentStatus === 'upcoming' && appointment.sortTimestamp > nowTimestamp;
    });
  }, [normalizedAppointments]);

  const fetchSlotsForAppointment = async (appointment) => {
    setIsRescheduleSlotsLoading(true);
    setAvailableRescheduleSlots([]);
    setSelectedRescheduleSlotId('');
    try {
      const token = localStorage.getItem('clinicToken');
      const response = appointment.providerType === 'service'
        ? await fetchClinicServiceAvailability(token, appointment.providerId)
        : await fetchClinicDoctorAvailability(token, appointment.doctorId);
      
      const upcomingSlots = (response?.slots || []).filter((slot) => {
        const slotDate = String(slot?.date || '').trim();
        const fromTime = String(slot?.fromTime || '').trim();
        const slotTimestamp = new Date(`${slotDate}T${fromTime}:00`).getTime();
        return slotTimestamp > Date.now();
      }).sort((a, b) => new Date(`${a.date}T${a.fromTime}:00`).getTime() - new Date(`${b.date}T${b.fromTime}:00`).getTime());

      setAvailableRescheduleSlots(upcomingSlots);
    } catch (error) {
      toast.error(error?.message || 'Could not fetch available slots for rescheduling');
    } finally {
      setIsRescheduleSlotsLoading(false);
    }
  };

  const openRescheduleModal = useCallback(async (appointment = null) => {
    const selectedAppt = appointment || reschedulableAppointments[0];
    if (!selectedAppt) {
      toast.error('No upcoming booked appointments available for rescheduling');
      return;
    }
    
    setAppointmentToReschedule(selectedAppt);
    setRescheduleReason('');
    fetchSlotsForAppointment(selectedAppt);
  }, [reschedulableAppointments]);

  const handleReschedulePatientChange = useCallback((event) => {
    const nextAppointmentId = String(event?.target?.value || '').trim();
    if (!nextAppointmentId) return;

    const selectedAppointment = reschedulableAppointments.find((entry) => String(entry?.id) === nextAppointmentId);
    if (selectedAppointment) {
      setAppointmentToReschedule(selectedAppointment);
      fetchSlotsForAppointment(selectedAppointment);
    }
  }, [reschedulableAppointments]);

  const closeRescheduleModal = useCallback(() => {
    setAppointmentToReschedule(null);
    setAvailableRescheduleSlots([]);
    setSelectedRescheduleSlotId('');
    setRescheduleReason('');
  }, []);

  const handleConfirmReschedule = useCallback(async () => {
    if (!appointmentToReschedule) return;
    if (!selectedRescheduleSlotId) {
      toast.error('Please select a new time slot');
      return;
    }
    const trimmedReason = String(rescheduleReason || '').trim();
    if (trimmedReason.length < 5) {
      toast.error('Please provide a reason (at least 5 characters)');
      return;
    }

    setIsRescheduleSubmitting(true);
    try {
      const token = localStorage.getItem('clinicToken');
      await rescheduleClinicAppointment(token, appointmentToReschedule.id, {
        newSlotId: selectedRescheduleSlotId,
        reason: trimmedReason
      });
      toast.success('Appointment rescheduled successfully');
      closeRescheduleModal();
      loadSchedule({ shouldShowLoading: true, shouldToastError: true });
      window.dispatchEvent(new Event('clinic-appointments-updated'));
    } catch (error) {
      toast.error(error?.message || 'Failed to reschedule appointment');
    } finally {
      setIsRescheduleSubmitting(false);
    }
  }, [appointmentToReschedule, selectedRescheduleSlotId, rescheduleReason, closeRescheduleModal, loadSchedule]);

  const selectedDoctor = selectedDoctorId === 'all' ? null : doctorById.get(String(selectedDoctorId));

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2 bg-[#FCFCFD]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1EBDB8]">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
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
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate((previousDate) => addDays(getWeekStart(previousDate), 7))}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Next week"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                  <polyline points="9 18 15 12 9 6" />
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
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.1em]">
              {selectedDoctor ? `Dr. ${selectedDoctor.fullName}` : 'All Doctors'}
            </span>
            <span className="text-[13px] font-semibold text-[#4B5563]">{formatRangeLabel(weekStartDate, weekEndDate)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedDoctorId('all')}
            className={`px-4 py-3 rounded-2xl border text-[13px] font-bold transition-all ${
              selectedDoctorId === 'all'
                ? 'bg-[#1EBDB8] border-[#1EBDB8] text-white shadow-lg'
                : 'bg-white border-gray-100 text-[#1F2432] hover:border-[#1EBDB8]/40 hover:bg-[#F8FAFC]'
            }`}
          >
            All Doctors
          </button>

          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              type="button"
              onClick={() => setSelectedDoctorId(doctor.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                String(selectedDoctorId) === String(doctor.id)
                  ? 'bg-[#1EBDB8] border-[#1EBDB8] text-white shadow-lg'
                  : 'bg-white border-gray-100 text-[#1F2432] hover:border-[#1EBDB8]/40 hover:bg-[#F8FAFC]'
              }`}
            >
              <span className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-[13px] font-bold uppercase ${
                String(selectedDoctorId) === String(doctor.id)
                  ? 'bg-white text-[#1EBDB8]'
                  : 'bg-slate-100 text-[#1EBDB8]'
              }`}>
                {doctor?.avatarUrl ? (
                  <img src={doctor.avatarUrl} alt={doctor.fullName} className="w-full h-full object-cover" />
                ) : (
                  String(doctor?.fullName || 'D').charAt(0)
                )}
              </span>
              <span className="text-left min-w-0">
                <span className="block text-[14px] font-bold truncate">Dr. {doctor.fullName}</span>
                <span className={`block text-[11px] font-medium truncate ${String(selectedDoctorId) === String(doctor.id) ? 'text-white/80' : 'text-[#6B7280]'}`}>
                  {doctor.specialization || 'Consultant'}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Types' },
            { id: 'doctor', label: 'Doctors' },
            { id: 'lab', label: 'Labs' },
            { id: 'facility', label: 'Facilities' }
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              type="button"
              onClick={() => setSelectedProviderFilter(filterOption.id)}
              className={`px-3 py-2 rounded-xl border text-[12px] font-bold transition-all ${
                selectedProviderFilter === filterOption.id
                  ? 'bg-[#1EBDB8] border-[#1EBDB8] text-white'
                  : 'bg-white border-gray-200 text-[#4B5563] hover:border-[#1EBDB8]/40'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden w-full min-w-0">
        {isLoading ? (
          <div className="px-6 py-10 text-center text-[14px] font-medium text-gray-500">
            Loading clinic schedule...
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

                              let bgClass = 'bg-[#DFF4F1] border-[#A7E3DB]';
                              let badgeTextClass = 'text-[#0F766E]';
                              let label = 'Upcoming';
                              let titleClass = 'text-[#1F2432]';
                              let textClass = 'text-[#334155]';
                              let isUpcoming = appointment.currentStatus === 'upcoming';

                              if (isCancelled) {
                                bgClass = 'bg-[#FEE2E2] border-[#FCA5A5]';
                                badgeTextClass = 'text-[#B91C1C]';
                                label = 'Cancelled';
                                titleClass = 'text-[#991B1B]';
                                textClass = 'text-[#991B1B]';
                              } else if (isOngoing) {
                                bgClass = 'bg-[#DCFCE7] border-[#86EFAC]';
                                badgeTextClass = 'text-[#166534]';
                                label = 'Ongoing';
                                titleClass = 'text-[#14532D]';
                                textClass = 'text-[#166534]';
                              } else if (isCompleted) {
                                bgClass = 'bg-[#F3F4F6] border-[#D1D5DB]';
                                badgeTextClass = 'text-[#4B5563]';
                                label = 'Completed';
                                titleClass = 'text-[#374151]';
                                textClass = 'text-[#4B5563]';
                              }

                              return (
                                <div
                                  key={appointment.id}
                                  className={`rounded-xl border px-3 py-2.5 shadow-sm ${bgClass}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className={`text-[14px] font-bold truncate ${titleClass}`}>
                                      {appointment.patientName}
                                    </p>
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.08em] ${badgeTextClass}`}>
                                      {label}
                                    </span>
                                  </div>

                                  <p className={`text-[11px] mt-1 truncate ${textClass}`}>
                                    {appointment.providerType === 'service' ? appointment.doctorName : `Dr. ${appointment.doctorName}`}
                                  </p>
                                  <p className={`text-[10px] font-bold uppercase tracking-[0.08em] mt-1 ${badgeTextClass}`}>
                                    {appointment.providerType === 'service'
                                      ? (appointment.serviceType === 'facility' ? 'Facility' : 'Lab')
                                      : 'Doctor'}
                                  </p>
                                  <p className={`text-[11px] truncate ${textClass}`}>
                                    {appointment.patientPhone}
                                  </p>
                                  <p className={`text-[11px] font-semibold mt-1 ${textClass}`}>
                                    {appointment.fromTime} - {appointment.toTime} - {formatModeLabel(appointment.consultationMode)}
                                  </p>
                                  {isUpcoming && (
                                    <button
                                      onClick={() => openRescheduleModal(appointment)}
                                      className="mt-3 w-full py-2 bg-white/60 hover:bg-white text-[#0F766E] text-[11px] font-bold rounded-lg transition-colors border border-[#1EBDB8]/20 hover:border-[#1EBDB8]/50"
                                    >
                                      Reschedule
                                    </button>
                                  )}
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

      {appointmentToReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2432]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <h3 className="text-[18px] font-bold text-[#1F2432]">Reschedule Appointment</h3>
              <button
                onClick={closeRescheduleModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                disabled={isRescheduleSubmitting}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-5 space-y-2">
                <label htmlFor="reschedule-patient" className="text-[14px] font-semibold text-[#1F2432]">Select Patient Appointment to Reschedule</label>
                <select
                  id="reschedule-patient"
                  value={String(appointmentToReschedule?.id || '')}
                  onChange={handleReschedulePatientChange}
                  disabled={isRescheduleSubmitting || reschedulableAppointments.length === 0}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20 disabled:opacity-60"
                >
                  {reschedulableAppointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {`${appointment.patientName} • ${appointment.providerType === 'service' ? appointment.doctorName : `Dr. ${appointment.doctorName}`} • ${new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric'
                      })} • ${appointment.fromTime}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 mb-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" />
                    <path d="M16 2V6" />
                    <path d="M8 2V6" />
                    <path d="M3 10H21" />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-blue-900 mb-1">
                    {appointmentToReschedule.patientName}
                  </p>
                  <p className="text-[13px] text-blue-800/70 font-medium">
                    Current: {new Date(appointmentToReschedule.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric'
                    })} • {appointmentToReschedule.fromTime}
                  </p>
                </div>
              </div>

              {isRescheduleSlotsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#1EBDB8]/30 border-t-[#1EBDB8] rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-gray-500 mt-4">Finding available slots...</p>
                </div>
              ) : availableRescheduleSlots.length === 0 ? (
                <div className="py-10 text-center bg-gray-50 rounded-2xl border border-gray-100">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mx-auto mb-3">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <p className="text-gray-900 font-bold mb-1">No alternative slots available</p>
                  <p className="text-gray-500 text-sm max-w-[250px] mx-auto">This provider doesn't have any upcoming available slots for this patient.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Select New Slot <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                      {availableRescheduleSlots.map((slot) => {
                        const isSelected = selectedRescheduleSlotId === slot.id;
                        const slotDate = new Date(slot.date);
                        
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedRescheduleSlotId(slot.id)}
                            className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${
                              isSelected 
                                ? 'border-[#1EBDB8] bg-[#1EBDB8]/5 shadow-sm' 
                                : 'border-gray-100 hover:border-[#1EBDB8]/30 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`text-[13px] font-bold mb-1 ${isSelected ? 'text-[#0F766E]' : 'text-gray-900'}`}>
                              {slotDate.toLocaleDateString('en-US', {
                                weekday: 'short', month: 'short', day: 'numeric'
                              })}
                            </span>
                            <span className={`text-[12px] font-semibold ${isSelected ? 'text-[#115E59]' : 'text-gray-500'}`}>
                              {slot.fromTime} - {slot.toTime}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Reason for Rescheduling <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder="Please explain why you need to reschedule... (will be sent to the patient)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1EBDB8]/20 focus:border-[#1EBDB8] resize-none h-[100px] text-[14px] text-gray-900 bg-white"
                    />
                    <p className="text-[12px] text-gray-500 mt-2">
                      Minimum 5 characters. The patient will be notified via email.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={closeRescheduleModal}
                disabled={isRescheduleSubmitting}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                disabled={isRescheduleSubmitting || !selectedRescheduleSlotId || availableRescheduleSlots.length === 0}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1EBDB8] hover:bg-[#1CAAAE] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isRescheduleSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm Reschedule</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
