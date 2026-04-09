import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AvailabilityForm from './AvailabilityForm';
import AvailabilityList from './AvailabilityList';
import {
  addDoctorAvailability,
  deleteDoctorAvailabilitySlot,
  fetchDoctorAvailability,
  fetchDoctorProfile,
  updateDoctorAvailabilitySlot
} from '../../../services/authApi';

const MISSING_FIELD_LABELS = {
  name: 'Name',
  avatar: 'Avatar',
  phone: 'Phone Number',
  address: 'Clinic Address',
  bio: 'Bio',
};

const EMPTY_FORM = {
  date: '',
  fromTime: '',
  toTime: '',
  consultationMode: 'online',
  priceInRupees: ''
};

const formatModeLabel = (mode) => {
  return String(mode || '').toLowerCase() === 'offline' ? 'Offline (Clinic Visit)' : 'Online';
};

const toMinutes = (timeValue) => {
  const [hours, minutes] = String(timeValue || '').split(':').map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return hours * 60 + minutes;
};

const getDoctorTokenOrThrow = () => {
  const doctorToken = localStorage.getItem('doctorToken');

  if (!doctorToken) {
    throw new Error('Please login again to manage availability');
  }

  return doctorToken;
};

const normalizeMissingFields = (fields) => {
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields
    .map((field) => String(field || '').trim().toLowerCase())
    .filter(Boolean);
};

export default function AvailabilityPage({ onGoToProfile }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [slots, setSlots] = useState([]);
  const [editingSlotId, setEditingSlotId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingProfileFields, setMissingProfileFields] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadAvailability = async () => {
      try {
        const doctorToken = getDoctorTokenOrThrow();
        const [profileData, availabilityData] = await Promise.all([
          fetchDoctorProfile(doctorToken),
          fetchDoctorAvailability(doctorToken)
        ]);

        if (isMounted) {
          setMissingProfileFields(normalizeMissingFields(profileData?.profile?.missingFields));
          setSlots(Array.isArray(availabilityData.slots) ? availabilityData.slots : []);
        }
      } catch (error) {
        if (isMounted) {
          if (Array.isArray(error?.data?.missingFields)) {
            setMissingProfileFields(normalizeMissingFields(error.data.missingFields));
          }

          toast.error(error?.message || 'Could not fetch availability slots');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAvailability();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedSlots = useMemo(() => {
    return [...slots].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return toMinutes(a.fromTime) - toMinutes(b.fromTime);
    });
  }, [slots]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingSlotId('');
  };

  const isProfileComplete = missingProfileFields.length === 0;
  const missingFieldNames = missingProfileFields
    .map((field) => MISSING_FIELD_LABELS[field] || field)
    .join(', ');

  const requireCompletedProfile = () => {
    if (isProfileComplete) {
      return true;
    }

    toast.error('Complete your profile first before adding availability slots');

    if (typeof onGoToProfile === 'function') {
      onGoToProfile();
    }

    return false;
  };

  const validateForm = () => {
    if (!form.date || !form.fromTime || !form.toTime || !form.consultationMode) {
      toast.error('Date, from time, to time, and consultation mode are required');
      return false;
    }

    const parsedPrice = Number(form.priceInRupees);

    if (!Number.isFinite(parsedPrice) || !Number.isInteger(parsedPrice) || parsedPrice <= 0) {
      toast.error('Consultation fee in Rs. must be a whole number greater than 0');
      return false;
    }

    if (toMinutes(form.fromTime) >= toMinutes(form.toTime)) {
      toast.error('Start time must be earlier than end time');
      return false;
    }

    const overlap = slots.some((slot) => {
      if (editingSlotId && slot.id === editingSlotId) {
        return false;
      }

      if (slot.date !== form.date) {
        return false;
      }

      const existingStart = toMinutes(slot.fromTime);
      const existingEnd = toMinutes(slot.toTime);
      const newStart = toMinutes(form.fromTime);
      const newEnd = toMinutes(form.toTime);

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

    if (!requireCompletedProfile()) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const doctorToken = getDoctorTokenOrThrow();

      if (editingSlotId) {
        const data = await updateDoctorAvailabilitySlot(doctorToken, editingSlotId, form);

        if (Array.isArray(data.slots)) {
          setSlots(data.slots);
        }

        toast.success('Availability slot updated');
        resetForm();
        return;
      }

      const data = await addDoctorAvailability(doctorToken, form);

      if (Array.isArray(data.slots)) {
        setSlots(data.slots);
      }

      toast.success('Availability slot added');
      resetForm();
    } catch (error) {
      toast.error(error?.message || 'Could not save availability slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSlot = (slot) => {
    if (!requireCompletedProfile()) {
      return;
    }

    setForm({
      date: slot.date,
      fromTime: slot.fromTime,
      toTime: slot.toTime,
      consultationMode: slot.consultationMode || 'online',
      priceInRupees: String(slot.priceInRupees ?? '')
    });
    setEditingSlotId(slot.id);
  };

  const handleDeleteSlot = async (slot) => {
    const shouldDelete = window.confirm(
      `Delete ${formatModeLabel(slot.consultationMode)} availability on ${slot.date} from ${slot.fromTime} to ${slot.toTime}?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      const doctorToken = getDoctorTokenOrThrow();
      const data = await deleteDoctorAvailabilitySlot(doctorToken, slot.id);

      if (Array.isArray(data.slots)) {
        setSlots(data.slots);
      }

      if (editingSlotId === slot.id) {
        resetForm();
      }

      toast.success('Availability slot deleted');
    } catch (error) {
      toast.error(error?.message || 'Could not delete availability slot');
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
        <h1 className="text-[24px] font-bold text-[#1F2432]">Set Availability</h1>
        <p className="text-[14px] text-[#9CA3AF] font-medium mt-1">
          Manage your available consultation times so patients can book correctly.
        </p>
      </div>

      {!isProfileComplete && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-amber-800">Complete profile first</p>
            <p className="text-[13px] text-amber-700 mt-1">
              Add all required profile details before adding availability slots.
            </p>
            <p className="text-[13px] text-amber-800 font-medium mt-2">Missing: {missingFieldNames}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof onGoToProfile === 'function') {
                onGoToProfile();
              }
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-bold"
          >
            Complete Profile
          </button>
        </div>
      )}

      <AvailabilityForm
        form={form}
        isEditing={Boolean(editingSlotId)}
        isSubmitting={isSubmitting}
        isBlocked={!isProfileComplete}
        blockMessage="Complete your profile first before adding availability slots."
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancelEdit={resetForm}
      />

      {isLoading ? (
        <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
          <p className="text-[14px] font-medium text-[#6B7280]">Loading availability slots...</p>
        </div>
      ) : (
        <AvailabilityList
          slots={sortedSlots}
          onEdit={handleEditSlot}
          onDelete={handleDeleteSlot}
          isActionsDisabled={!isProfileComplete}
          disabledHint="Complete your profile first before editing or deleting availability slots."
        />
      )}
    </div>
  );
}
