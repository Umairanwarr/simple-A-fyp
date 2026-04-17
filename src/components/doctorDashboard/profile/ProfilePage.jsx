import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  fetchDoctorProfile,
  updateDoctorAvatar,
  updateDoctorProfile,
  fetchDoctorBankAccount,
  saveDoctorBankAccount
} from '../../../services/authApi';
import { getDoctorSessionProfile, saveSessionUser } from '../../../utils/authSession';
import ProfileField from './components/ProfileField';
import ProfileOverviewCard from './components/ProfileOverviewCard';

const MISSING_FIELD_LABELS = {
  name: 'Name',
  avatar: 'Avatar',
  phone: 'Phone Number',
  address: 'Clinic Address',
  bio: 'Bio',
  bank_account: 'Bank Account Details'
};

const getDoctorTokenOrThrow = () => {
  const doctorToken = localStorage.getItem('doctorToken');

  if (!doctorToken) {
    throw new Error('Please login again to update profile');
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

export default function ProfilePage({ onProfileUpdated }) {
  const sessionProfile = getDoctorSessionProfile();
  const avatarInputRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experience, setExperience] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(sessionProfile.avatarUrl);
  const [missingFields, setMissingFields] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  // Bank account state
  const [bankAccountTitle, setBankAccountTitle] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [isSavingBank, setIsSavingBank] = useState(false);

  const hydrateProfile = (data) => {
    const profile = data?.profile || {};

    setFullName(String(profile.fullName || '').trim());
    setEmail(String(profile.email || '').trim());
    setPhone(String(profile.phone || '').trim());
    setSpecialization(String(profile.specialization || '').trim());
    setLicenseNumber(String(profile.licenseNumber || '').trim());
    setExperience(String(profile.experience ?? '').trim());
    setAddress(String(profile.address || '').trim());
    setBio(String(profile.bio || ''));
    setAvatarUrl(String(profile.avatarUrl || '').trim() || sessionProfile.avatarUrl);
    setMissingFields(normalizeMissingFields(profile.missingFields));

    if (data?.doctor) {
      saveSessionUser('doctor', data.doctor);
    }

    if (typeof onProfileUpdated === 'function') {
      onProfileUpdated(data);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const doctorToken = getDoctorTokenOrThrow();
        const data = await fetchDoctorProfile(doctorToken);

        if (!isMounted) {
          return;
        }

        hydrateProfile(data);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast.error(error?.message || 'Could not load profile');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    // Load bank account info
    const loadBankAccount = async () => {
      try {
        const token = getDoctorTokenOrThrow();
        const data = await fetchDoctorBankAccount(token);
        if (data.bankAccount) {
          setBankAccountTitle(String(data.bankAccount.accountTitle || ''));
          setBankAccountNumber(String(data.bankAccount.accountNumber || ''));
          setBankName(String(data.bankAccount.bankName || ''));
        }
      } catch {}
    };
    loadBankAccount();

    return () => {
      isMounted = false;
    };
  }, []);

  const validateProfile = () => {
    const nextErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = 'Name is required';
    }

    if (!phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    }

    if (!address.trim()) {
      nextErrors.address = 'Clinic address is required';
    }

    if (!bio.trim()) {
      nextErrors.bio = 'Bio is required';
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
      const doctorToken = getDoctorTokenOrThrow();

      const data = await updateDoctorProfile(doctorToken, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        bio: bio.trim()
      });

      hydrateProfile(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      if (Array.isArray(error?.data?.missingFields)) {
        const serverErrors = {};

        if (error.data.missingFields.includes('name')) {
          serverErrors.fullName = 'Name is required';
        }

        if (error.data.missingFields.includes('phone')) {
          serverErrors.phone = 'Phone number is required';
        }

        if (error.data.missingFields.includes('address')) {
          serverErrors.address = 'Clinic address is required';
        }

        if (error.data.missingFields.includes('bio')) {
          serverErrors.bio = 'Bio is required';
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
      const doctorToken = getDoctorTokenOrThrow();
      const data = await updateDoctorAvatar(doctorToken, selectedFile);

      if (data?.doctor) {
        saveSessionUser('doctor', data.doctor);
      }

      if (data?.profile) {
        setMissingFields(normalizeMissingFields(data.profile.missingFields));
      }

      setAvatarUrl(String(data?.doctor?.avatarUrl || '').trim() || avatarUrl);

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
            <h3 className="text-[20px] font-bold text-[#1F2432]">Professional Details</h3>
            <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
              Editable: name, phone number, clinic address, and bio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ProfileField
            label="Full Name"
            value={fullName}
            placeholder="Enter your full name"
            onChange={(event) => {
              setFullName(event.target.value);
              setErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            error={errors.fullName}
            disabled={isSaving}
          />

          <ProfileField
            label="Phone Number"
            value={phone}
            placeholder="Enter your phone number"
            onChange={(event) => {
              setPhone(event.target.value);
              setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            error={errors.phone}
            disabled={isSaving}
          />

          <ProfileField
            label="Professional Email"
            value={email}
            readOnly
          />

          <ProfileField
            label="Specialization"
            value={specialization}
            readOnly
          />

          <ProfileField
            label="Medical License Number"
            value={licenseNumber}
            readOnly
          />

          <ProfileField
            label="Years of Experience"
            value={experience}
            readOnly
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ProfileField
            label="City"
            value={address}
            placeholder="Enter your city"
            onChange={(event) => {
              setAddress(event.target.value);
              setErrors((prev) => ({ ...prev, address: '' }));
            }}
            error={errors.address}
            disabled={isSaving}
            multiline
            rows={5}
          />

          <ProfileField
            label="Bio"
            value={bio}
            placeholder="Write a short professional bio"
            onChange={(event) => {
              setBio(event.target.value);
              setErrors((prev) => ({ ...prev, bio: '' }));
            }}
            error={errors.bio}
            disabled={isSaving}
            multiline
            rows={5}
          />
        </div>

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

      {/* Bank Account Section */}
      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm space-y-5">
        <div>
          <h3 className="text-[20px] font-bold text-[#1F2432]">Bank Account</h3>
          <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">
            Add your bank account details to withdraw your earnings. Minimum withdrawal is PKR 5,000.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ProfileField
            label="Account Title"
            value={bankAccountTitle}
            placeholder="e.g. Dr. Ahmed Ali"
            onChange={e => setBankAccountTitle(e.target.value)}
            disabled={isSavingBank}
          />
          <ProfileField
            label="Account Number / IBAN"
            value={bankAccountNumber}
            placeholder="e.g. PK36SCBL0000001123456702"
            onChange={e => setBankAccountNumber(e.target.value)}
            disabled={isSavingBank}
          />
          <ProfileField
            label="Bank Name"
            value={bankName}
            placeholder="e.g. HBL, UBL, Meezan Bank"
            onChange={e => setBankName(e.target.value)}
            disabled={isSavingBank}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={isSavingBank}
            onClick={async () => {
              if (!bankAccountTitle.trim() || !bankAccountNumber.trim() || !bankName.trim()) {
                return toast.error('All bank account fields are required');
              }
              try {
                setIsSavingBank(true);
                const token = getDoctorTokenOrThrow();
                await saveDoctorBankAccount(token, {
                  accountTitle: bankAccountTitle.trim(),
                  accountNumber: bankAccountNumber.trim(),
                  bankName: bankName.trim()
                });
                toast.success('Bank account saved successfully');
                const profileData = await fetchDoctorProfile(token);
                hydrateProfile(profileData);
              } catch (err) {
                toast.error(err.message || 'Could not save bank account');
              } finally {
                setIsSavingBank(false);
              }
            }}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold"
          >
            {isSavingBank ? 'Saving...' : 'Save Bank Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
