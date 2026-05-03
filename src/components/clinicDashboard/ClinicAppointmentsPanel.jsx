import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  fetchClinicAvailability,
  fetchClinicDoctors,
  createClinicDoctorAvailability,
  updateClinicDoctorAvailabilitySlot,
  deleteClinicDoctorAvailabilitySlot,
  fetchClinicAppointments,
  createClinicAppointment,
  cancelClinicAppointment
} from '../../services/authApi';

const EMPTY_AVAILABILITY_FORM = {
  doctorId: '',
  date: '',
  fromTime: '',
  toTime: '',
  consultationMode: 'online',
  offlineAddress: '',
  priceInRupees: ''
};

const EMPTY_APPOINTMENT_FORM = {
  doctorId: '',
  patientName: '',
  patientPhone: '',
  appointmentDate: '',
  fromTime: '',
  toTime: '',
  consultationMode: 'offline',
  notes: ''
};

const formatReadableDate = (rawDate) => {
  if (!rawDate) return '';
  const parsedDate = new Date(`${rawDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return rawDate;
  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

const formatModeLabel = (mode) => {
  const m = String(mode || '').toLowerCase();
  if (m === 'offline') return 'Offline (Clinic Visit)';
  if (m === 'video') return 'Online (Video Call)';
  return 'Online (Text)';
};

const getModeBadgeClassName = (mode) => {
  const m = String(mode || '').toLowerCase();
  if (m === 'offline') return 'bg-blue-50 text-blue-700 border border-blue-100';
  if (m === 'video') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  return 'bg-teal-50 text-teal-700 border border-teal-100';
};

const toMinutes = (timeValue) => {
  const [hours, minutes] = String(timeValue || '').split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

const getClinicTokenOrThrow = () => {
  const clinicToken = localStorage.getItem('clinicToken');
  if (!clinicToken) {
    throw new Error('Please login again to continue');
  }
  return clinicToken;
};

export default function ClinicAppointmentsPanel() {
  // Tabs: 'schedules' | 'appointments' | 'doctors'
  const [activeTab, setActiveTab] = useState('schedules');
  const [activeSection, setActiveSection] = useState('upcoming'); // for appointments tab

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slots, setSlots] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [ongoingAppointments, setOngoingAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);

  // Loading and Submitting states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingAvailability, setIsSubmittingAvailability] = useState(false);
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [isCancellingAppointmentId, setIsCancellingAppointmentId] = useState('');

  // Forms states
  const [availabilityForm, setAvailabilityForm] = useState(EMPTY_AVAILABILITY_FORM);
  const [appointmentForm, setAppointmentForm] = useState(EMPTY_APPOINTMENT_FORM);
  const [editingSlotId, setEditingSlotId] = useState('');

  const loadData = async (shouldShowLoading = true) => {
    try {
      if (shouldShowLoading) setIsLoading(true);
      const clinicToken = getClinicTokenOrThrow();

      const [doctorResponse, availabilityResponse, appointmentResponse] = await Promise.all([
        fetchClinicDoctors(clinicToken),
        fetchClinicAvailability(clinicToken),
        fetchClinicAppointments(clinicToken)
      ]);

      const loadedDoctors = Array.isArray(doctorResponse?.doctors) ? doctorResponse.doctors : [];

      // Merge availability slots into doctors
      const availabilityData = availabilityResponse?.doctors || [];
      const doctorsWithSlots = loadedDoctors.map((doctor) => {
        const availabilityEntry = availabilityData.find(
          (entry) => String(entry?.doctor?.id) === String(doctor?.id)
        );
        return {
          ...doctor,
          slots: availabilityEntry?.slots || [],
          totalSlots: availabilityEntry?.totalSlots || 0
        };
      });

      setDoctors(doctorsWithSlots);
      setUpcomingAppointments(Array.isArray(appointmentResponse?.upcomingAppointments) ? appointmentResponse.upcomingAppointments : []);
      setOngoingAppointments(Array.isArray(appointmentResponse?.ongoingAppointments) ? appointmentResponse.ongoingAppointments : []);
      setCancelledAppointments(Array.isArray(appointmentResponse?.cancelledAppointments) ? appointmentResponse.cancelledAppointments : []);

      // Autoselect first doctor if available and none selected yet
      if (doctorsWithSlots.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(doctorsWithSlots[0].id);
        setSlots(doctorsWithSlots[0].slots || []);
      }
    } catch (error) {
      if (shouldShowLoading) {
        toast.error(error?.message || 'Could not load availability or appointments data');
      }
    } finally {
      if (shouldShowLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  // Sync slots whenever the selected doctor changes
  useEffect(() => {
    if (selectedDoctorId) {
      const selectedDoctor = doctors.find((d) => String(d.id) === String(selectedDoctorId));
      setSlots(selectedDoctor?.slots || []);
    } else {
      setSlots([]);
    }
  }, [selectedDoctorId, doctors]);

  const sortedSlots = useMemo(() => {
    return [...slots].sort((a, b) => {
      const dateCompare = String(a.date || '').localeCompare(String(b.date || ''));
      if (dateCompare !== 0) return dateCompare;
      return toMinutes(a.fromTime) - toMinutes(b.fromTime);
    });
  }, [slots]);

  const sortedUpcomingAppointments = useMemo(() => {
    return [...upcomingAppointments].sort((a, b) => {
      const dateCompare = String(a.date || '').localeCompare(String(b.date || ''));
      if (dateCompare !== 0) return dateCompare;
      return toMinutes(a.fromTime) - toMinutes(b.fromTime);
    });
  }, [upcomingAppointments]);

  const sortedOngoingAppointments = useMemo(() => {
    return [...ongoingAppointments].sort((a, b) => {
      const dateCompare = String(a.date || '').localeCompare(String(b.date || ''));
      if (dateCompare !== 0) return dateCompare;
      return toMinutes(a.fromTime) - toMinutes(b.fromTime);
    });
  }, [ongoingAppointments]);

  const sortedCancelledAppointments = useMemo(() => {
    return [...cancelledAppointments].sort((a, b) => {
      const dateCompare = String(b.date || '').localeCompare(String(a.date || ''));
      if (dateCompare !== 0) return dateCompare;
      return toMinutes(b.fromTime) - toMinutes(a.fromTime);
    });
  }, [cancelledAppointments]);

  const visibleAppointments = activeSection === 'ongoing'
    ? sortedOngoingAppointments
    : activeSection === 'cancelled'
      ? sortedCancelledAppointments
      : sortedUpcomingAppointments;

  const canManage = doctors.length > 0;
  const selectedDoctor = doctors.find((d) => String(d.id) === String(selectedDoctorId));

  // --- Availability Slots Handlers ---
  const resetAvailabilityForm = () => {
    setAvailabilityForm(EMPTY_AVAILABILITY_FORM);
    setEditingSlotId('');
  };

  const handleAvailabilityChange = (field, value) => {
    if (field === 'consultationMode') {
      setAvailabilityForm((prev) => ({
        ...prev,
        consultationMode: value,
        offlineAddress: value === 'offline' ? prev.offlineAddress : ''
      }));
      return;
    }
    setAvailabilityForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateAvailabilityForm = () => {
    if (!availabilityForm.date || !availabilityForm.fromTime || !availabilityForm.toTime || !availabilityForm.consultationMode) {
      toast.error('Date, from time, to time, and consultation mode are required');
      return false;
    }
    const parsedPrice = Number(availabilityForm.priceInRupees);
    if (!Number.isFinite(parsedPrice) || !Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      toast.error('Consultation fee in Rs. must be a whole number greater than 0');
      return false;
    }
    if (toMinutes(availabilityForm.fromTime) >= toMinutes(availabilityForm.toTime)) {
      toast.error('Start time must be earlier than end time');
      return false;
    }
    if (availabilityForm.consultationMode === 'offline' && !String(availabilityForm.offlineAddress || '').trim()) {
      toast.error('Offline clinic address is required for clinic visit slots');
      return false;
    }
    // Overlap check
    const overlap = slots.some((slot) => {
      if (editingSlotId && slot.id === editingSlotId) return false;
      if (slot.date !== availabilityForm.date) return false;
      const existingStart = toMinutes(slot.fromTime);
      const existingEnd = toMinutes(slot.toTime);
      const newStart = toMinutes(availabilityForm.fromTime);
      const newEnd = toMinutes(availabilityForm.toTime);
      return newStart < existingEnd && newEnd > existingStart;
    });
    if (overlap) {
      toast.error('This slot overlaps with another availability slot on the same date');
      return false;
    }
    return true;
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    if (!canManage) {
      toast.error('Please register at least one doctor first');
      return;
    }
    if (!selectedDoctorId) {
      toast.error('Please select a doctor');
      return;
    }
    if (!validateAvailabilityForm()) return;

    try {
      setIsSubmittingAvailability(true);
      const clinicToken = getClinicTokenOrThrow();
      const payload = {
        date: availabilityForm.date,
        fromTime: availabilityForm.fromTime,
        toTime: availabilityForm.toTime,
        consultationMode: availabilityForm.consultationMode,
        offlineAddress: availabilityForm.consultationMode === 'offline' ? availabilityForm.offlineAddress : '',
        priceInRupees: Number(availabilityForm.priceInRupees)
      };

      if (editingSlotId) {
        const response = await updateClinicDoctorAvailabilitySlot(clinicToken, selectedDoctorId, editingSlotId, payload);
        if (response?.slots) {
          setSlots(response.slots);
          setDoctors((prev) => prev.map((d) =>
            String(d.id) === String(selectedDoctorId)
              ? { ...d, slots: response.slots, totalSlots: response.slots.length }
              : d
          ));
        }
        toast.success('Availability slot updated successfully');
      } else {
        const response = await createClinicDoctorAvailability(clinicToken, selectedDoctorId, payload);
        if (response?.slots) {
          setSlots(response.slots);
          setDoctors((prev) => prev.map((d) =>
            String(d.id) === String(selectedDoctorId)
              ? { ...d, slots: response.slots, totalSlots: response.slots.length }
              : d
          ));
        }
        toast.success('Availability slot added successfully');
      }
      resetAvailabilityForm();
    } catch (error) {
      toast.error(error?.message || 'Could not save availability slot');
    } finally {
      setIsSubmittingAvailability(false);
    }
  };

  const handleEditSlot = (slot) => {
    setAvailabilityForm({
      doctorId: selectedDoctorId,
      date: slot.date,
      fromTime: slot.fromTime,
      toTime: slot.toTime,
      consultationMode: slot.consultationMode || 'online',
      offlineAddress: String(slot.offlineAddress || '').trim(),
      priceInRupees: String(slot.priceInRupees ?? '')
    });
    setEditingSlotId(slot.id);
  };

  const handleDeleteSlot = async (slot) => {
    const shouldDelete = window.confirm(
      `Are you sure you want to delete this ${formatModeLabel(slot.consultationMode)} slot on ${slot.date}?`
    );
    if (!shouldDelete) return;

    try {
      const clinicToken = getClinicTokenOrThrow();
      const response = await deleteClinicDoctorAvailabilitySlot(clinicToken, selectedDoctorId, slot.id);
      if (response?.slots) {
        setSlots(response.slots);
        setDoctors((prev) => prev.map((d) =>
          String(d.id) === String(selectedDoctorId)
            ? { ...d, slots: response.slots, totalSlots: response.slots.length }
            : d
        ));
      }
      if (editingSlotId === slot.id) {
        resetAvailabilityForm();
      }
      toast.success('Availability slot deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Could not delete availability slot');
    }
  };

  // --- Bookings & Appointments Handlers ---
  const handleAppointmentFormChange = (field, value) => {
    setAppointmentForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetAppointmentForm = () => {
    setAppointmentForm(EMPTY_APPOINTMENT_FORM);
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!canManage) {
      toast.error('Please register at least one doctor first');
      return;
    }
    if (!appointmentForm.doctorId || !appointmentForm.patientName || !appointmentForm.appointmentDate || !appointmentForm.fromTime || !appointmentForm.toTime) {
      toast.error('Doctor, patient name, date, and times are required');
      return;
    }
    if (toMinutes(appointmentForm.fromTime) >= toMinutes(appointmentForm.toTime)) {
      toast.error('From time must be earlier than To time');
      return;
    }

    try {
      setIsSubmittingAppointment(true);
      const clinicToken = getClinicTokenOrThrow();

      const response = await createClinicAppointment(clinicToken, {
        doctorId: appointmentForm.doctorId,
        patientName: appointmentForm.patientName,
        patientPhone: appointmentForm.patientPhone,
        appointmentDate: appointmentForm.appointmentDate,
        fromTime: appointmentForm.fromTime,
        toTime: appointmentForm.toTime,
        consultationMode: appointmentForm.consultationMode,
        notes: appointmentForm.notes
      });

      if (response?.appointment) {
        setUpcomingAppointments((prev) => [response.appointment, ...prev]);
      }
      toast.success('Appointment booked successfully');
      resetAppointmentForm();
      loadData(false);
    } catch (error) {
      toast.error(error?.message || 'Could not schedule appointment');
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const shouldCancel = window.confirm('Are you sure you want to cancel this appointment?');
    if (!shouldCancel) return;

    try {
      setIsCancellingAppointmentId(appointmentId);
      const clinicToken = getClinicTokenOrThrow();
      const response = await cancelClinicAppointment(clinicToken, appointmentId);

      setUpcomingAppointments((prev) => prev.filter((a) => String(a.id) !== String(appointmentId)));
      if (response?.appointment) {
        setCancelledAppointments((prev) => [response.appointment, ...prev]);
      }
      toast.success('Appointment cancelled successfully');
      loadData(false);
    } catch (error) {
      toast.error(error?.message || 'Could not cancel appointment');
    } finally {
      setIsCancellingAppointmentId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading & Tabs */}
      <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-[26px] font-extrabold text-[#1F2432] tracking-tight">Availability & Bookings</h1>
          <p className="text-[14px] font-medium text-[#6B7280] mt-1">
            Centrally manage doctor availability schedules, track upcoming bookings, and set new patient appointments.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="inline-flex p-1 bg-[#F4F7FB] border border-gray-100 rounded-[18px] w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('schedules')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] text-[13px] font-bold transition-all duration-200 ${
              activeTab === 'schedules'
                ? 'bg-white text-[#111827] shadow-md translate-y-[-1px]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Schedules & Slots
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] text-[13px] font-bold transition-all duration-200 ${
              activeTab === 'appointments'
                ? 'bg-white text-[#111827] shadow-md translate-y-[-1px]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            Bookings & Appointments
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('doctors')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] text-[13px] font-bold transition-all duration-200 ${
              activeTab === 'doctors'
                ? 'bg-white text-[#111827] shadow-md translate-y-[-1px]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Registered Doctors
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-[30px] border border-gray-100 shadow-sm text-center">
          <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#1EBDB8] rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="text-[14px] font-semibold text-[#6B7280] mt-3">Loading all scheduling data...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: SCHEDULES & SLOTS */}
          {activeTab === 'schedules' && (
            <div className="space-y-6">
              {/* Doctor Selector */}
              <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-[18px] font-bold text-[#1F2432]">Select Doctor</h3>
                    <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
                      Choose a doctor to view and manage their availability slots.
                    </p>
                  </div>
                  {!canManage && (
                    <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full">
                      Register doctor first
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => setSelectedDoctorId(doctor.id)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all duration-300 ${
                        selectedDoctorId === doctor.id
                          ? 'bg-[#1EBDB8] border-[#1EBDB8] text-white shadow-lg translate-y-[-2px]'
                          : 'bg-white border-gray-100 text-[#1F2432] hover:border-[#1EBDB8]/40 hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-gray-200 flex items-center justify-center shrink-0">
                        {doctor?.avatarUrl ? (
                          <img src={doctor.avatarUrl} alt={doctor.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span className={`text-[14px] font-bold uppercase ${selectedDoctorId === doctor.id ? 'text-[#1EBDB8]' : 'text-[#1EBDB8]'}`}>
                            {String(doctor?.fullName || 'D').charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`text-[15px] font-bold tracking-tight truncate ${selectedDoctorId === doctor.id ? 'text-white' : 'text-[#1F2432]'}`}>
                          {doctor.fullName}
                        </p>
                        <p className={`text-[12px] font-medium truncate ${selectedDoctorId === doctor.id ? 'text-white/80' : 'text-[#6B7280]'}`}>
                          {doctor.specialization} • {doctor.totalSlots || 0} slots
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form & List */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form Column */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm h-fit">
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-[20px] font-bold text-[#1F2432] tracking-tight">
                        {editingSlotId ? 'Edit Availability Slot' : 'Add Availability Slot'}
                      </h2>
                      <p className="text-[13.5px] text-[#9CA3AF] font-medium mt-1">
                        {selectedDoctor
                          ? `Setting availability for Dr. ${selectedDoctor.fullName}`
                          : 'Select a doctor to manage their timeslots.'}
                      </p>
                    </div>
                    {editingSlotId && (
                      <button
                        type="button"
                        onClick={resetAvailabilityForm}
                        disabled={isSubmittingAvailability}
                        className="px-3 py-2 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleAvailabilitySubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-bold text-[#6B7280]">Date</span>
                      <input
                        type="date"
                        value={availabilityForm.date}
                        disabled={!canManage || !selectedDoctorId || isSubmittingAvailability}
                        onChange={(e) => handleAvailabilityChange('date', e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-[#6B7280]">From</span>
                        <input
                          type="time"
                          value={availabilityForm.fromTime}
                          disabled={!canManage || !selectedDoctorId || isSubmittingAvailability}
                          onChange={(e) => handleAvailabilityChange('fromTime', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-[#6B7280]">To</span>
                        <input
                          type="time"
                          value={availabilityForm.toTime}
                          disabled={!canManage || !selectedDoctorId || isSubmittingAvailability}
                          onChange={(e) => handleAvailabilityChange('toTime', e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-bold text-[#6B7280]">Consultation Mode</span>
                      <select
                        value={availabilityForm.consultationMode}
                        disabled={!canManage || !selectedDoctorId || isSubmittingAvailability}
                        onChange={(e) => handleAvailabilityChange('consultationMode', e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                        required
                      >
                        <option value="online">Online (Text)</option>
                        <option value="video">Online (Video Call)</option>
                        <option value="offline">Offline (Clinic Visit)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[13px] font-bold text-[#6B7280]">Consultation Fee (Rs.)</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g., 1500"
                        value={availabilityForm.priceInRupees}
                        disabled={!canManage || !selectedDoctorId || isSubmittingAvailability}
                        onChange={(e) => handleAvailabilityChange('priceInRupees', e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                        required
                      />
                    </div>

                    {availabilityForm.consultationMode === 'offline' && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] font-bold text-[#6B7280]">Offline Clinic Address</span>
                        <input
                          type="text"
                          value={availabilityForm.offlineAddress}
                          disabled={!canManage || !selectedDoctorId || isSubmittingAvailability}
                          onChange={(e) => handleAvailabilityChange('offlineAddress', e.target.value)}
                          placeholder="Full address where the patient should visit"
                          className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                          required
                        />
                      </div>
                    )}

                    <div className="mt-2">
                      <button
                        type="submit"
                        disabled={!canManage || !selectedDoctorId || isSubmittingAvailability}
                        className="inline-flex items-center justify-center w-full gap-2 px-5 py-4 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-bold shadow-lg shadow-[#1EBDB8]/20 hover:shadow-xl hover:shadow-[#1EBDB8]/30 transition-all duration-300"
                      >
                        {isSubmittingAvailability ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          editingSlotId ? 'Update Slot' : 'Add Availability Slot'
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Slots List Column */}
                <div className="lg:col-span-3 bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[18px] font-bold text-[#1F2432]">
                        {selectedDoctor ? `${selectedDoctor.fullName}'s Availability Slots` : 'Availability Slots'}
                      </h3>
                      <span className="text-[12px] font-bold text-[#1EBDB8] uppercase tracking-[0.12em] bg-[#1EBDB8]/10 px-2.5 py-1 rounded-lg">
                        {sortedSlots.length} Slots
                      </span>
                    </div>

                    {sortedSlots.length === 0 ? (
                      <div className="border border-dashed border-gray-200 bg-[#F8FAFC] rounded-2xl p-10 text-center flex flex-col items-center">
                        <svg className="text-[#6B7280]/40 mb-3" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <p className="text-[14px] font-bold text-[#6B7280]">No slots added yet</p>
                        <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
                          {selectedDoctor
                            ? `Add ${selectedDoctor.fullName}'s first availability slot using the form.`
                            : 'Select a doctor to begin adding availability slots.'}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[650px] border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="px-3 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Date</th>
                              <th className="px-3 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Timings</th>
                              <th className="px-3 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Consultation</th>
                              <th className="px-3 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Fee</th>
                              <th className="px-3 py-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedSlots.map((slot) => (
                              <tr key={slot.id} className="border-b border-gray-50 hover:bg-[#F8FAFC]/50 transition-colors duration-200">
                                <td className="px-3 py-4 text-[13.5px] font-bold text-[#1F2432]">
                                  {formatReadableDate(slot.date)}
                                </td>
                                <td className="px-3 py-4 text-[13.5px] font-medium text-[#4B5563]">
                                  {slot.fromTime} - {slot.toTime}
                                </td>
                                <td className="px-3 py-4">
                                  <div className="flex flex-col gap-1 max-w-[180px]">
                                    <span className={`inline-flex items-center self-start px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-wide ${getModeBadgeClassName(slot.consultationMode)}`}>
                                      {formatModeLabel(slot.consultationMode)}
                                    </span>
                                    {slot.consultationMode === 'offline' && slot.offlineAddress && (
                                      <p className="text-[11px] text-[#6B7280] truncate font-medium mt-0.5" title={slot.offlineAddress}>
                                        {slot.offlineAddress}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-4 text-[14px] font-semibold text-[#111827]">
                                  Rs. {slot.priceInRupees}
                                </td>
                                <td className="px-3 py-4 text-right">
                                  <div className="inline-flex justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleEditSlot(slot)}
                                      className="p-2 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-[#1F2432] transition-colors"
                                      title="Edit slot"
                                    >
                                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSlot(slot)}
                                      className="p-2 rounded-xl border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                      title="Delete slot"
                                    >
                                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS & APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Add New Appointment Form */}
              <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-[20px] font-bold text-[#1F2432] tracking-tight">Set New Appointment</h3>
                    <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
                      Directly schedule walk-ins or manual bookings with clinic doctors.
                    </p>
                  </div>
                  {!canManage && (
                    <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full">
                      Register doctor first
                    </span>
                  )}
                </div>

                <form onSubmit={handleAppointmentSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="flex flex-col gap-1.5 md:col-span-4">
                    <span className="text-[13px] font-bold text-[#6B7280]">Select Doctor</span>
                    <select
                      value={appointmentForm.doctorId}
                      disabled={!canManage || isSubmittingAppointment}
                      onChange={(e) => handleAppointmentFormChange('doctorId', e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                      required
                    >
                      <option value="">Choose registered doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>Dr. {doctor.fullName} ({doctor.specialization})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-4">
                    <span className="text-[13px] font-bold text-[#6B7280]">Patient Name</span>
                    <input
                      type="text"
                      placeholder="Enter patient full name"
                      value={appointmentForm.patientName}
                      disabled={!canManage || isSubmittingAppointment}
                      onChange={(e) => handleAppointmentFormChange('patientName', e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-4">
                    <span className="text-[13px] font-bold text-[#6B7280]">Patient Phone</span>
                    <input
                      type="text"
                      placeholder="e.g., +92 312 3456789"
                      value={appointmentForm.patientPhone}
                      disabled={!canManage || isSubmittingAppointment}
                      onChange={(e) => handleAppointmentFormChange('patientPhone', e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-3">
                    <span className="text-[13px] font-bold text-[#6B7280]">Date</span>
                    <input
                      type="date"
                      value={appointmentForm.appointmentDate}
                      disabled={!canManage || isSubmittingAppointment}
                      onChange={(e) => handleAppointmentFormChange('appointmentDate', e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="text-[13px] font-bold text-[#6B7280]">From</span>
                    <input
                      type="time"
                      value={appointmentForm.fromTime}
                      disabled={!canManage || isSubmittingAppointment}
                      onChange={(e) => handleAppointmentFormChange('fromTime', e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="text-[13px] font-bold text-[#6B7280]">To</span>
                    <input
                      type="time"
                      value={appointmentForm.toTime}
                      disabled={!canManage || isSubmittingAppointment}
                      onChange={(e) => handleAppointmentFormChange('toTime', e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <span className="text-[13px] font-bold text-[#6B7280]">Mode</span>
                    <select
                      value={appointmentForm.consultationMode}
                      disabled={!canManage || isSubmittingAppointment}
                      onChange={(e) => handleAppointmentFormChange('consultationMode', e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                      required
                    >
                      <option value="offline">Clinic Visit</option>
                      <option value="video">Online (Video)</option>
                      <option value="online">Online (Text)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-3">
                    <button
                      type="submit"
                      disabled={!canManage || isSubmittingAppointment}
                      className="inline-flex items-center justify-center w-full gap-2 px-5 py-3.5 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13.5px] font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#1EBDB8]/20"
                    >
                      {isSubmittingAppointment ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Scheduling...
                        </>
                      ) : (
                        'Book Appointment'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Toggle Sections (Upcoming / Ongoing / Cancelled) */}
              <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[18px] font-bold text-[#1F2432] tracking-tight">Existing Bookings</h3>
                  <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
                    Review and filter status of appointments for doctors.
                  </p>
                </div>

                <div className="inline-flex p-1 bg-[#F4F7FB] border border-gray-100 rounded-[16px] self-start md:self-center">
                  <button
                    type="button"
                    onClick={() => setActiveSection('upcoming')}
                    className={`px-4 py-2.5 rounded-[12px] text-[12px] font-bold transition-all duration-200 ${
                      activeSection === 'upcoming'
                        ? 'bg-white text-[#111827] shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    Upcoming ({upcomingAppointments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('ongoing')}
                    className={`px-4 py-2.5 rounded-[12px] text-[12px] font-bold transition-all duration-200 ${
                      activeSection === 'ongoing'
                        ? 'bg-white text-[#111827] shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    Ongoing ({ongoingAppointments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('cancelled')}
                    className={`px-4 py-2.5 rounded-[12px] text-[12px] font-bold transition-all duration-200 ${
                      activeSection === 'cancelled'
                        ? 'bg-white text-[#111827] shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    Cancelled ({cancelledAppointments.length})
                  </button>
                </div>
              </div>

              {/* Bookings Display Area */}
              <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
                {visibleAppointments.length === 0 ? (
                  <div className="border border-dashed border-gray-200 bg-[#F8FAFC] rounded-2xl p-12 text-center flex flex-col items-center">
                    <svg className="text-[#6B7280]/30 mb-2.5" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <p className="text-[14.5px] font-bold text-[#6B7280]">
                      No {activeSection} appointments found.
                    </p>
                    <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
                      {activeSection === 'upcoming'
                        ? 'There are no upcoming appointments scheduled yet.'
                        : activeSection === 'ongoing'
                        ? 'There are no appointments ongoing right now.'
                        : 'No appointments have been cancelled yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {visibleAppointments.map((appointment) => {
                      const canCancel = activeSection === 'upcoming';
                      const isCancelled = activeSection === 'cancelled';
                      const isOngoing = activeSection === 'ongoing';

                      return (
                        <div
                          key={appointment.id}
                          className="rounded-2xl border border-gray-100 bg-[#F9FAFB]/50 p-5 hover:bg-white hover:border-[#1EBDB8]/20 hover:shadow-lg transition-all duration-300 flex flex-col gap-4 relative group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-wider font-extrabold text-[#9CA3AF]">
                                {formatReadableDate(appointment.date)}
                              </p>
                              <h4 className="mt-0.5 text-[17px] font-bold text-[#1F2432] tracking-tight truncate">
                                {appointment.fromTime} - {appointment.toTime}
                              </h4>
                            </div>

                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              isCancelled
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : isOngoing
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {isCancelled ? 'Cancelled' : isOngoing ? 'Ongoing' : 'Upcoming'}
                            </span>
                          </div>

                          {/* Patient details */}
                          <div className="flex flex-col gap-1 border-t border-gray-100/60 pt-3">
                            <p className="text-[11px] text-[#6B7280] font-bold uppercase tracking-wider">Patient Details</p>
                            <p className="text-[14px] font-bold text-[#111827]">
                              {appointment?.patientName || appointment?.patient?.name || 'Patient Name Not Set'}
                            </p>
                            {appointment?.patientPhone || appointment?.patient?.phone ? (
                              <p className="text-[12.5px] font-medium text-[#4B5563]">
                                {appointment?.patientPhone || appointment?.patient?.phone}
                              </p>
                            ) : null}
                          </div>

                          {/* Doctor details */}
                          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-gray-200">
                              {appointment?.doctor?.avatarUrl ? (
                                <img src={appointment.doctor.avatarUrl} alt={appointment.doctor.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[13px] font-bold text-[#1EBDB8] uppercase">
                                  {String(appointment?.doctor?.fullName || appointment?.doctor?.name || 'D').charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-[#111827] truncate">
                                Dr. {appointment?.doctor?.fullName || appointment?.doctor?.name || 'Doctor'}
                              </p>
                              <p className="text-[11px] font-medium text-[#6B7280] truncate">
                                {appointment?.doctor?.specialization || 'General'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100/60 pt-3 mt-auto">
                            <span className="text-[12px] font-medium text-[#4B5563]">
                              Mode: <strong className="text-[#1F2432]">{formatModeLabel(appointment.consultationMode)}</strong>
                            </span>
                            {canCancel && (
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(appointment.id)}
                                disabled={isCancellingAppointmentId === String(appointment.id)}
                                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-[11.5px] font-bold transition duration-200 border border-red-100"
                              >
                                {isCancellingAppointmentId === String(appointment.id) ? 'Cancelling...' : 'Cancel Booking'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTERED DOCTORS OVERVIEW */}
          {activeTab === 'doctors' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-[#1F2432]">Registered Doctor Schedules & Summaries</h3>
                  <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
                    An operational view of all clinic doctors along with their scheduling capacity.
                  </p>
                </div>
                <span className="text-[12px] font-bold text-[#1EBDB8] uppercase tracking-[0.12em] bg-[#1EBDB8]/10 px-2.5 py-1 rounded-lg">
                  {doctors.length} Doctors
                </span>
              </div>

              {doctors.length === 0 ? (
                <div className="bg-white p-12 rounded-[30px] border border-gray-100 shadow-sm text-center flex flex-col items-center">
                  <svg className="text-amber-500 mb-2.5" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[15px] font-bold text-[#6B7280]">No registered doctors found</p>
                  <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
                    To start setting schedules and appointments, you must add doctors under the Staff Management tab first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => {
                    const upcomingDocs = upcomingAppointments.filter((a) => String(a?.doctor?.id) === String(doctor.id));

                    return (
                      <div key={doctor.id} className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-gray-100 flex items-center justify-center shrink-0">
                              {doctor?.avatarUrl ? (
                                <img src={doctor.avatarUrl} alt={doctor.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[16px] font-bold text-[#1EBDB8] uppercase">
                                  {String(doctor?.fullName || 'D').charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[17px] font-bold text-[#1F2432] tracking-tight truncate">
                                Dr. {doctor.fullName}
                              </h4>
                              <p className="text-[13px] font-semibold text-[#1EBDB8] truncate">
                                {doctor.specialization || 'Consultant'}
                              </p>
                              <p className="text-[12px] font-medium text-[#6B7280] truncate mt-0.5">
                                {doctor.experienceYears ? `${doctor.experienceYears} Years Exp.` : 'Clinic Doctor'}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 border-t border-b border-gray-50 py-4 mb-4">
                            <div className="bg-[#FAFAFB] p-3 rounded-xl border border-gray-100 text-center">
                              <p className="text-[20px] font-extrabold text-[#111827]">{doctor.totalSlots || 0}</p>
                              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">Active Slots</p>
                            </div>
                            <div className="bg-[#FAFAFB] p-3 rounded-xl border border-gray-100 text-center">
                              <p className="text-[20px] font-extrabold text-[#111827]">{upcomingDocs.length}</p>
                              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">Active Bookings</p>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoctorId(doctor.id);
                            setActiveTab('schedules');
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#1EBDB8] text-[#1EBDB8] text-[12.5px] font-bold hover:bg-[#1EBDB8] hover:text-white transition-all duration-300"
                        >
                          View Doctor Availability & Slots
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
