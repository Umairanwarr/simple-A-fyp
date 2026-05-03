import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  fetchClinicAvailability,
  fetchClinicDoctors,
  createClinicDoctorAvailability,
  updateClinicDoctorAvailabilitySlot,
  deleteClinicDoctorAvailabilitySlot
} from '../../services/authApi';

const EMPTY_FORM = {
  doctorId: '',
  date: '',
  fromTime: '',
  toTime: '',
  consultationMode: 'online',
  offlineAddress: '',
  priceInRupees: ''
};

const formatReadableDate = (rawDate) => {
  if (!rawDate) return '';
  return new Date(rawDate).toLocaleDateString('en-US', {
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
  if (m === 'offline') return 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]';
  if (m === 'video') return 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]';
  return 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingSlotId, setEditingSlotId] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAvailabilityData = async () => {
      try {
        setIsLoading(true);
        const clinicToken = getClinicTokenOrThrow();

        const [doctorResponse, availabilityResponse] = await Promise.all([
          fetchClinicDoctors(clinicToken),
          fetchClinicAvailability(clinicToken)
        ]);

        if (!isMounted) return;

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

        // Select first doctor by default if available and no doctor selected yet
        if (doctorsWithSlots.length > 0 && !selectedDoctorId) {
          const firstDoctor = doctorsWithSlots[0];
          setSelectedDoctorId(firstDoctor.id);
          setSlots(firstDoctor.slots || []);
        }
      } catch (error) {
        if (!isMounted) return;
        setDoctors([]);
        setSlots([]);
        toast.error(error?.message || 'Could not load availability data');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAvailabilityData();
    return () => { isMounted = false; };
  }, []);

  // Update slots when selected doctor changes
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

  const canManageSlots = doctors.length > 0;

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingSlotId('');
  };

  const handleChange = (field, value) => {
    if (field === 'consultationMode') {
      setFormData((prev) => ({
        ...prev,
        consultationMode: value,
        offlineAddress: value === 'offline' ? prev.offlineAddress : ''
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.date || !formData.fromTime || !formData.toTime || !formData.consultationMode) {
      toast.error('Date, from time, to time, and consultation mode are required');
      return false;
    }
    const parsedPrice = Number(formData.priceInRupees);
    if (!Number.isFinite(parsedPrice) || !Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      toast.error('Consultation fee in Rs. must be a whole number greater than 0');
      return false;
    }
    if (toMinutes(formData.fromTime) >= toMinutes(formData.toTime)) {
      toast.error('Start time must be earlier than end time');
      return false;
    }
    if (formData.consultationMode === 'offline' && !String(formData.offlineAddress || '').trim()) {
      toast.error('Offline clinic address is required for clinic visit slots');
      return false;
    }
    // Check for overlapping slots
    const overlap = slots.some((slot) => {
      if (editingSlotId && slot.id === editingSlotId) return false;
      if (slot.date !== formData.date) return false;
      const existingStart = toMinutes(slot.fromTime);
      const existingEnd = toMinutes(slot.toTime);
      const newStart = toMinutes(formData.fromTime);
      const newEnd = toMinutes(formData.toTime);
      return newStart < existingEnd && newEnd > existingStart;
    });
    if (overlap) {
      toast.error('This slot overlaps with another availability slot on the same date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManageSlots) {
      toast.error('Please register at least one doctor first');
      return;
    }
    if (!selectedDoctorId) {
      toast.error('Please select a doctor');
      return;
    }
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const clinicToken = getClinicTokenOrThrow();
      const payload = {
        date: formData.date,
        fromTime: formData.fromTime,
        toTime: formData.toTime,
        consultationMode: formData.consultationMode,
        offlineAddress: formData.consultationMode === 'offline' ? formData.offlineAddress : '',
        priceInRupees: Number(formData.priceInRupees)
      };

      if (editingSlotId) {
        const response = await updateClinicDoctorAvailabilitySlot(clinicToken, selectedDoctorId, editingSlotId, payload);
        if (response?.slots) {
          setSlots(response.slots);
          // Update doctors state with new slots
          setDoctors((prev) => prev.map((d) =>
            String(d.id) === String(selectedDoctorId)
              ? { ...d, slots: response.slots, totalSlots: response.slots.length }
              : d
          ));
        }
        toast.success('Availability slot updated');
      } else {
        const response = await createClinicDoctorAvailability(clinicToken, selectedDoctorId, payload);
        if (response?.slots) {
          setSlots(response.slots);
          // Update doctors state with new slots
          setDoctors((prev) => prev.map((d) =>
            String(d.id) === String(selectedDoctorId)
              ? { ...d, slots: response.slots, totalSlots: response.slots.length }
              : d
          ));
        }
        toast.success('Availability slot added');
      }
      resetForm();
    } catch (error) {
      toast.error(error?.message || 'Could not save availability slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSlot = (slot) => {
    setFormData({
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
      `Delete ${formatModeLabel(slot.consultationMode)} availability on ${slot.date} from ${slot.fromTime} to ${slot.toTime}?`
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
        resetForm();
      }
      toast.success('Availability slot deleted');
    } catch (error) {
      toast.error(error?.message || 'Could not delete availability slot');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
        <h1 className="text-[24px] font-bold text-[#1F2432]">Set Doctor Availability</h1>
        <p className="text-[14px] text-[#9CA3AF] font-medium mt-1">
          Manage available consultation times for your clinic doctors so patients can book appointments.
        </p>
      </div>

      {/* Doctor Selector */}
      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[18px] font-bold text-[#1F2432]">Select Doctor</h3>
            <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
              Choose a doctor to view and manage their availability slots.
            </p>
          </div>
          {!canManageSlots && (
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                selectedDoctorId === doctor.id
                  ? 'bg-[#1EBDB8] border-[#1EBDB8] text-white shadow-md'
                  : 'bg-white border-gray-200 text-[#1F2432] hover:border-[#1EBDB8] hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                {doctor?.avatarUrl ? (
                  <img src={doctor.avatarUrl} alt={doctor.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className={`text-[12px] font-bold uppercase ${selectedDoctorId === doctor.id ? 'text-[#1EBDB8]' : 'text-[#1EBDB8]'}`}>
                    {String(doctor?.fullName || 'D').charAt(0)}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className={`text-[14px] font-bold ${selectedDoctorId === doctor.id ? 'text-white' : 'text-[#1F2432]'}`}>
                  {doctor.fullName}
                </p>
                <p className={`text-[12px] font-medium ${selectedDoctorId === doctor.id ? 'text-white/80' : 'text-[#6B7280]'}`}>
                  {doctor.specialization} • {doctor.totalSlots || 0} slots
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Availability Form */}
      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h2 className="text-[20px] font-bold text-[#1F2432]">
              {editingSlotId ? 'Edit Availability Slot' : 'Add Availability Slot'}
            </h2>
            <p className="text-[13.5px] text-[#9CA3AF] font-medium mt-1">
              {selectedDoctor
                ? `Managing availability for ${selectedDoctor.fullName}`
                : 'Select a doctor to add availability slots'}
            </p>
          </div>
          {editingSlotId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="px-3 py-2 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <label className="flex flex-col gap-2 md:col-span-1">
            <span className="text-[13px] font-bold text-[#6B7280]">Date</span>
            <input
              type="date"
              value={formData.date}
              disabled={!canManageSlots || !selectedDoctorId || isSubmitting}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[#6B7280]">From</span>
            <input
              type="time"
              value={formData.fromTime}
              disabled={!canManageSlots || !selectedDoctorId || isSubmitting}
              onChange={(e) => handleChange('fromTime', e.target.value)}
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[#6B7280]">To</span>
            <input
              type="time"
              value={formData.toTime}
              disabled={!canManageSlots || !selectedDoctorId || isSubmitting}
              onChange={(e) => handleChange('toTime', e.target.value)}
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
              required
            />
          </label>

          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-[13px] font-bold text-[#6B7280]">Consultation Mode</span>
            <select
              value={formData.consultationMode}
              disabled={!canManageSlots || !selectedDoctorId || isSubmitting}
              onChange={(e) => handleChange('consultationMode', e.target.value)}
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
              required
            >
              <option value="online">Online (Text)</option>
              <option value="video">Online (Video Call)</option>
              <option value="offline">Offline (Clinic Visit)</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[#6B7280]">Fee (Rs.)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.priceInRupees}
              disabled={!canManageSlots || !selectedDoctorId || isSubmitting}
              onChange={(e) => handleChange('priceInRupees', e.target.value)}
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
              required
            />
          </label>

          {formData.consultationMode === 'offline' ? (
            <label className="flex flex-col gap-2 md:col-span-3">
              <span className="text-[13px] font-bold text-[#6B7280]">Offline Clinic Address</span>
              <input
                type="text"
                value={formData.offlineAddress}
                disabled={!canManageSlots || !selectedDoctorId || isSubmitting}
                onChange={(e) => handleChange('offlineAddress', e.target.value)}
                placeholder="Enter clinic address for this slot"
                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
                required
              />
            </label>
          ) : null}

          <div className="md:col-span-6 flex justify-end mt-1">
            <button
              type="submit"
              disabled={!canManageSlots || !selectedDoctorId || isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold transition-colors"
            >
              {isSubmitting ? 'Saving...' : editingSlotId ? 'Update Slot' : 'Add Slot'}
            </button>
          </div>
        </form>
      </div>

      {/* Slots List */}
      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-[#1F2432]">
            {selectedDoctor ? `${selectedDoctor.fullName}'s Availability Slots` : 'Availability Slots'}
          </h3>
          <span className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.12em]">
            {sortedSlots.length} Total
          </span>
        </div>

        {isLoading ? (
          <div className="border border-gray-100 bg-[#F9FAFB] rounded-2xl p-8 text-center">
            <p className="text-[14px] font-medium text-[#6B7280]">Loading availability slots...</p>
          </div>
        ) : sortedSlots.length === 0 ? (
          <div className="border border-dashed border-gray-200 bg-[#F8FAFC] rounded-2xl p-8 text-center">
            <p className="text-[14px] font-bold text-[#6B7280]">No availability slots added yet</p>
            <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
              {selectedDoctor
                ? `Add ${selectedDoctor.fullName}'s first availability slot using the form above.`
                : 'Select a doctor and add their first availability slot using the form above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[940px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Date</th>
                  <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">From</th>
                  <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">To</th>
                  <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Mode</th>
                  <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Offline Address</th>
                  <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">Fee</th>
                  <th className="px-3 py-3 text-[12px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSlots.map((slot) => (
                  <tr key={slot.id} className="border-b border-gray-50 hover:bg-[#F8FAFC]/60 transition-colors">
                    <td className="px-3 py-4 text-[14px] font-bold text-[#1F2432]">{formatReadableDate(slot.date)}</td>
                    <td className="px-3 py-4 text-[14px] font-medium text-[#4B5563]">{slot.fromTime}</td>
                    <td className="px-3 py-4 text-[14px] font-medium text-[#4B5563]">{slot.toTime}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${getModeBadgeClassName(slot.consultationMode)}`}>
                        {formatModeLabel(slot.consultationMode)}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-[13px] font-medium text-[#4B5563] max-w-[280px] truncate" title={slot.offlineAddress || ''}>
                      {slot.consultationMode === 'offline' ? (slot.offlineAddress || 'Not set') : '-'}
                    </td>
                    <td className="px-3 py-4 text-[14px] font-semibold text-[#1F2432]">Rs. {slot.priceInRupees}</td>
                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditSlot(slot)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] font-bold text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slot)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100"
                        >
                          Delete
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
  );
}
