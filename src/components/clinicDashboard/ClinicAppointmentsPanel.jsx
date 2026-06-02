import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  fetchClinicAvailability,
  fetchClinicDoctors,
  createClinicDoctorAvailability,
  updateClinicDoctorAvailabilitySlot,
  deleteClinicDoctorAvailabilitySlot
} from '../../services/authApi';

const EMPTY_AVAILABILITY_FORM = {
  date: '',
  fromTime: '',
  toTime: '',
  consultationMode: 'offline',
  priceInRupees: ''
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

const formatModeLabel = () => {
  return 'Clinic Visit';
};

const getModeBadgeClassName = () => {
  return 'bg-blue-50 text-blue-700 border border-blue-100';
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
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingAvailability, setIsSubmittingAvailability] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState(EMPTY_AVAILABILITY_FORM);
  const [editingSlotId, setEditingSlotId] = useState('');

  const selectedDoctor = doctors.find((doctor) => String(doctor.id) === String(selectedDoctorId));
  const canManage = doctors.length > 0;

  useEffect(() => {
    const loadAvailabilityData = async () => {
      try {
        setIsLoading(true);
        const clinicToken = getClinicTokenOrThrow();

        const [doctorResponse, availabilityResponse] = await Promise.all([
          fetchClinicDoctors(clinicToken),
          fetchClinicAvailability(clinicToken)
        ]);

        const loadedDoctors = Array.isArray(doctorResponse?.doctors) ? doctorResponse.doctors : [];
        const availabilityData = Array.isArray(availabilityResponse?.doctors) ? availabilityResponse.doctors : [];
        const doctorsWithSlots = loadedDoctors.map((doctor) => {
          const availabilityEntry = availabilityData.find(
            (entry) => String(entry?.doctor?.id) === String(doctor?.id)
          );
          const doctorSlots = Array.isArray(availabilityEntry?.slots) ? availabilityEntry.slots : [];

          return {
            ...doctor,
            slots: doctorSlots,
            totalSlots: Number(availabilityEntry?.totalSlots ?? doctorSlots.length)
          };
        });

        setDoctors(doctorsWithSlots);

        if (doctorsWithSlots.length > 0) {
          setSelectedDoctorId(doctorsWithSlots[0].id);
          setSlots(doctorsWithSlots[0].slots || []);
        }
      } catch (error) {
        toast.error(error?.message || 'Could not load clinic availability data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailabilityData();
  }, []);

  useEffect(() => {
    if (!selectedDoctorId) {
      setSlots([]);
      return;
    }

    const nextSelectedDoctor = doctors.find((doctor) => String(doctor.id) === String(selectedDoctorId));
    setSlots(nextSelectedDoctor?.slots || []);
  }, [selectedDoctorId, doctors]);

  const sortedSlots = useMemo(() => {
    return [...slots].sort((firstSlot, secondSlot) => {
      const dateCompare = String(firstSlot.date || '').localeCompare(String(secondSlot.date || ''));
      if (dateCompare !== 0) return dateCompare;
      return toMinutes(firstSlot.fromTime) - toMinutes(secondSlot.fromTime);
    });
  }, [slots]);

  const resetAvailabilityForm = () => {
    setAvailabilityForm(EMPTY_AVAILABILITY_FORM);
    setEditingSlotId('');
  };

  const handleAvailabilityChange = (field, value) => {
    setAvailabilityForm((previousForm) => ({ ...previousForm, [field]: value }));
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

    const overlapsExistingSlot = slots.some((slot) => {
      if (editingSlotId && String(slot.id) === String(editingSlotId)) return false;
      if (slot.date !== availabilityForm.date) return false;
      const existingStart = toMinutes(slot.fromTime);
      const existingEnd = toMinutes(slot.toTime);
      const newStart = toMinutes(availabilityForm.fromTime);
      const newEnd = toMinutes(availabilityForm.toTime);
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (overlapsExistingSlot) {
      toast.error('This slot overlaps with another availability slot on the same date');
      return false;
    }

    return true;
  };

  const updateSelectedDoctorSlots = (nextSlots) => {
    setSlots(nextSlots);
    setDoctors((previousDoctors) => previousDoctors.map((doctor) =>
      String(doctor.id) === String(selectedDoctorId)
        ? { ...doctor, slots: nextSlots, totalSlots: nextSlots.length }
        : doctor
    ));
  };

  const handleAvailabilitySubmit = async (event) => {
    event.preventDefault();

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
        consultationMode: 'offline',
        priceInRupees: Number(availabilityForm.priceInRupees)
      };

      if (editingSlotId) {
        const response = await updateClinicDoctorAvailabilitySlot(clinicToken, selectedDoctorId, editingSlotId, payload);
        if (Array.isArray(response?.slots)) {
          updateSelectedDoctorSlots(response.slots);
        }
        toast.success('Availability slot updated successfully');
      } else {
        const response = await createClinicDoctorAvailability(clinicToken, selectedDoctorId, payload);
        if (Array.isArray(response?.slots)) {
          updateSelectedDoctorSlots(response.slots);
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
      date: slot.date,
      fromTime: slot.fromTime,
      toTime: slot.toTime,
      consultationMode: 'offline',
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
      if (Array.isArray(response?.slots)) {
        updateSelectedDoctorSlots(response.slots);
      }
      if (String(editingSlotId) === String(slot.id)) {
        resetAvailabilityForm();
      }
      toast.success('Availability slot deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Could not delete availability slot');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
        <h1 className="text-[26px] font-extrabold text-[#1F2432] tracking-tight">Doctor Availability</h1>
        <p className="text-[14px] font-medium text-[#6B7280] mt-1">
          Manage clinic doctor schedules and consultation slots.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-[30px] border border-gray-100 shadow-sm text-center">
          <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#1EBDB8] rounded-full" role="status" aria-label="loading">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="text-[14px] font-semibold text-[#6B7280] mt-3">Loading availability data...</p>
        </div>
      ) : (
        <div className="space-y-6">
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
                    String(selectedDoctorId) === String(doctor.id)
                      ? 'bg-[#1EBDB8] border-[#1EBDB8] text-white shadow-lg translate-y-[-2px]'
                      : 'bg-white border-gray-100 text-[#1F2432] hover:border-[#1EBDB8]/40 hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-gray-200 flex items-center justify-center shrink-0">
                    {doctor?.avatarUrl ? (
                      <img src={doctor.avatarUrl} alt={doctor.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[14px] font-bold uppercase text-[#1EBDB8]">
                        {String(doctor?.fullName || 'D').charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-[15px] font-bold tracking-tight truncate ${String(selectedDoctorId) === String(doctor.id) ? 'text-white' : 'text-[#1F2432]'}`}>
                      {doctor.fullName}
                    </p>
                    <p className={`text-[12px] font-medium truncate ${String(selectedDoctorId) === String(doctor.id) ? 'text-white/80' : 'text-[#6B7280]'}`}>
                      {doctor.specialization} - {doctor.totalSlots || 0} slots
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
                    onChange={(event) => handleAvailabilityChange('date', event.target.value)}
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
                      onChange={(event) => handleAvailabilityChange('fromTime', event.target.value)}
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
                      onChange={(event) => handleAvailabilityChange('toTime', event.target.value)}
                      className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-bold text-[#6B7280]">Consultation Mode</span>
                  <div className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432]">
                    Clinic Visit
                  </div>
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
                    onChange={(event) => handleAvailabilityChange('priceInRupees', event.target.value)}
                    className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-4 focus:ring-[#1EBDB8]/10 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canManage || !selectedDoctorId || isSubmittingAvailability}
                  className="mt-2 inline-flex items-center justify-center w-full gap-2 px-5 py-4 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-bold shadow-lg shadow-[#1EBDB8]/20 hover:shadow-xl hover:shadow-[#1EBDB8]/30 transition-all duration-300"
                >
                  {isSubmittingAvailability ? 'Saving...' : editingSlotId ? 'Update Slot' : 'Add Availability Slot'}
                </button>
              </form>
            </div>

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
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
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
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSlot(slot)}
                                  className="p-2 rounded-xl border border-red-100 hover:border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                  title="Delete slot"
                                >
                                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
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
    </div>
  );
}
