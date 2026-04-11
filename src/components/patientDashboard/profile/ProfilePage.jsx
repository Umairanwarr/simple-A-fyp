import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  fetchPatientProfile,
  updatePatientAvatar,
  updatePatientProfile
} from '../../../services/authApi';
import { getPatientSessionProfile, saveSessionUser } from '../../../utils/authSession';
import ProfileField from './components/ProfileField';
import ProfileOverviewCard from './components/ProfileOverviewCard';

const MISSING_FIELD_LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  phone: 'Phone Number',
  location: 'Location',
  avatar: 'Avatar'
};

const PHONE_PATTERN = /^\d{7,15}$/;

const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(String(email || '').trim());
};

const normalizeMissingFields = (fields) => {
  if (!Array.isArray(fields)) {
    return [];
  }

  return fields
    .map((field) => String(field || '').trim())
    .filter(Boolean);
};

const getPatientTokenOrThrow = () => {
  const patientToken = localStorage.getItem('patientToken');

  if (!patientToken) {
    throw new Error('Please login again to update profile');
  }

  return patientToken;
};

export default function ProfilePage({ onProfileUpdated }) {
  const sessionProfile = getPatientSessionProfile();
  const avatarInputRef = useRef(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(sessionProfile.avatarUrl);
  const [missingFields, setMissingFields] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  const hydrateProfile = (data) => {
    const profile = data?.profile || {};

    setFirstName(String(profile.firstName || '').trim());
    setLastName(String(profile.lastName || '').trim());
    setEmail(String(profile.email || '').trim());
    setPhone(String(profile.phone || '').trim());
    setLocation(String(profile.location || '').trim());
    setAvatarUrl(String(profile.avatarUrl || '').trim() || sessionProfile.avatarUrl);
    setMissingFields(normalizeMissingFields(profile.missingFields));

    if (data?.patient) {
      saveSessionUser('patient', data.patient);
    }

    if (typeof onProfileUpdated === 'function') {
      onProfileUpdated(data);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const patientToken = getPatientTokenOrThrow();
        const data = await fetchPatientProfile(patientToken);

        if (!isMounted) {
          return;
        }

        hydrateProfile(data);
      } catch (error) {
        if (isMounted) {
          toast.error(error?.message || 'Could not load profile');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const validateProfile = () => {
    const nextErrors = {};
    const normalizedPhone = String(phone || '').replace(/\D/g, '').slice(0, 15);

    if (!firstName.trim()) {
      nextErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      nextErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!normalizedPhone) {
      nextErrors.phone = 'Phone number is required';
    } else if (!PHONE_PATTERN.test(normalizedPhone)) {
      nextErrors.phone = 'Phone number must be 7 to 15 digits';
    }

    if (!location.trim()) {
      nextErrors.location = 'Location is required';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please complete all required profile fields');
      return false;
    }

    return true;
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!validateProfile()) {
      return;
    }

    try {
      setIsSaving(true);
      const patientToken = getPatientTokenOrThrow();

      const data = await updatePatientProfile(patientToken, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: String(phone || '').replace(/\D/g, '').slice(0, 15),
        location: location.trim()
      });

      hydrateProfile(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      if (Array.isArray(error?.data?.missingFields)) {
        const serverErrors = {};

        if (error.data.missingFields.includes('firstName')) {
          serverErrors.firstName = 'First name is required';
        }

        if (error.data.missingFields.includes('lastName')) {
          serverErrors.lastName = 'Last name is required';
        }

        if (error.data.missingFields.includes('email')) {
          serverErrors.email = 'Email is required';
        }

        if (error.data.missingFields.includes('phone')) {
          serverErrors.phone = 'Phone number is required';
        }

        if (error.data.missingFields.includes('location')) {
          serverErrors.location = 'Location is required';
        }

        setErrors(serverErrors);
      }

      toast.error(error?.message || 'Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelection = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > 4 * 1024 * 1024) {
      toast.error('Avatar size must be less than 4MB');
      event.target.value = '';
      return;
    }

    try {
      setIsAvatarSaving(true);
      const patientToken = getPatientTokenOrThrow();
      const data = await updatePatientAvatar(patientToken, selectedFile);

      if (data?.patient) {
        saveSessionUser('patient', data.patient);
      }

      if (data?.profile) {
        setMissingFields(normalizeMissingFields(data.profile.missingFields));
      }

      setAvatarUrl(String(data?.patient?.avatarUrl || '').trim() || avatarUrl);

      if (typeof onProfileUpdated === 'function') {
        onProfileUpdated(data);
      }

      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error(error?.message || 'Could not update avatar');
    } finally {
      setIsAvatarSaving(false);
      event.target.value = '';
    }
  };

  const triggerAvatarPicker = () => {
    avatarInputRef.current?.click();
  };

  const fullName = `${firstName} ${lastName}`.trim();
  const isProfileComplete = missingFields.length === 0;
  const missingFieldNames = missingFields
    .map((field) => MISSING_FIELD_LABELS[field] || field)
    .join(', ');

  if (isLoading) {
    return (
      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
        <p className="text-[14px] font-medium text-[#6B7280]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileOverviewCard
        avatarUrl={avatarUrl}
        fullName={fullName}
        email={email}
        isProfileComplete={isProfileComplete}
        missingFieldNames={missingFieldNames}
        onAvatarUploadClick={triggerAvatarPicker}
        isAvatarSaving={isAvatarSaving}
      />

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarSelection}
      />

      <form
        onSubmit={handleSaveProfile}
        className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[20px] font-bold text-[#1F2432]">Personal Details</h3>
            <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
              Editable: first name, last name, email, phone number, and location.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ProfileField
            label="First Name"
            value={firstName}
            placeholder="Enter your first name"
            onChange={(event) => {
              setFirstName(event.target.value);
              setErrors((prev) => ({ ...prev, firstName: '' }));
            }}
            error={errors.firstName}
            disabled={isSaving}
          />

          <ProfileField
            label="Last Name"
            value={lastName}
            placeholder="Enter your last name"
            onChange={(event) => {
              setLastName(event.target.value);
              setErrors((prev) => ({ ...prev, lastName: '' }));
            }}
            error={errors.lastName}
            disabled={isSaving}
          />

          <ProfileField
            label="Email"
            value={email}
            placeholder="Enter your email"
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((prev) => ({ ...prev, email: '' }));
            }}
            error={errors.email}
            disabled={isSaving}
            type="email"
          />

          <ProfileField
            label="Phone Number"
            value={phone}
            placeholder="Enter your phone number"
            onChange={(event) => {
              setPhone(event.target.value.replace(/\D/g, '').slice(0, 15));
              setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            error={errors.phone}
            disabled={isSaving}
          />
        </div>

        <ProfileField
          label="Location"
          value={location}
          placeholder="Enter your city or area"
          onChange={(event) => {
            setLocation(event.target.value);
            setErrors((prev) => ({ ...prev, location: '' }));
          }}
          error={errors.location}
          disabled={isSaving}
          multiline
          rows={4}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
