import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  fetchClinicProfile,
  updateClinicProfile,
  updateClinicAvatar,
  fetchClinicBankAccount,
  saveClinicBankAccount
} from '../../services/authApi';

function ClinicProfileField({ label, value, onChange, placeholder, type = 'text', readOnly = false, error, disabled = false, multiline = false, rows = 4 }) {
  const baseClassName = readOnly
    ? 'w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#4B5563]'
    : 'w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20 disabled:opacity-70 transition-all';

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-bold text-[#6B7280]">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          rows={rows}
          className={`${baseClassName} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className={baseClassName}
        />
      )}
      {error && <p className="text-[11px] font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const FACILITY_TYPES = [
  'General Hospital',
  'Specialty Clinic',
  'Dental Clinic',
  'Eye Clinic',
  'Pediatric Clinic',
  'Rehabilitation Center',
  'Maternity Center',
  'Diagnostic Center',
  'Physiotherapy Center',
  'Mental Health Clinic',
  'Skin & Dermatology',
  'Orthopedic Clinic',
  'Other'
];

export default function ClinicProfile() {
  const avatarInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [isBankSaving, setIsBankSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    facilityType: '',
    address: '',
    avatarUrl: '',
    applicationStatus: '',
    createdAt: ''
  });

  const [bankData, setBankData] = useState({
    accountTitle: '',
    accountNumber: '',
    bankName: ''
  });

  const [errors, setErrors] = useState({});
  const [bankErrors, setBankErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('clinicToken');
      const [profileData, bankRes] = await Promise.all([
        fetchClinicProfile(token),
        fetchClinicBankAccount(token).catch(() => ({ bankAccount: {} }))
      ]);

      const clinic = profileData.clinic || {};
      const bank = bankRes.bankAccount || {};

      setFormData({
        name: clinic.name || '',
        email: clinic.email || '',
        phone: clinic.phone || '',
        facilityType: clinic.facilityType || '',
        address: clinic.address || '',
        avatarUrl: clinic.avatarUrl || '',
        applicationStatus: clinic.applicationStatus || '',
        createdAt: clinic.createdAt || ''
      });

      setBankData({
        accountTitle: bank.accountTitle || '',
        accountNumber: bank.accountNumber || '',
        bankName: bank.bankName || ''
      });
    } catch (err) {
      toast.error(err.message || 'Could not load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Clinic name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('clinicToken');
      const data = await updateClinicProfile(token, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        facilityType: formData.facilityType
      });
      toast.success(data.message || 'Profile updated successfully');

      // Update local session
      const clinic = JSON.parse(localStorage.getItem('clinic') || '{}');
      localStorage.setItem('clinic', JSON.stringify({ ...clinic, ...data.clinic }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      toast.error(err.message || 'Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAvatarSaving(true);
      const token = localStorage.getItem('clinicToken');
      const data = await updateClinicAvatar(token, file);
      setFormData(prev => ({ ...prev, avatarUrl: data.clinic.avatarUrl }));
      toast.success('Avatar updated successfully');

      const clinic = JSON.parse(localStorage.getItem('clinic') || '{}');
      localStorage.setItem('clinic', JSON.stringify({ ...clinic, avatarUrl: data.clinic.avatarUrl }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      toast.error(err.message || 'Could not update avatar');
    } finally {
      setIsAvatarSaving(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleBankChange = (e, field) => {
    setBankData(prev => ({ ...prev, [field]: e.target.value }));
    if (bankErrors[field]) setBankErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBankSave = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!bankData.accountTitle.trim()) newErrors.accountTitle = 'Account Title is required';
    if (!bankData.accountNumber.trim()) newErrors.accountNumber = 'Account Number is required';
    if (!bankData.bankName.trim()) newErrors.bankName = 'Bank Name is required';

    if (Object.keys(newErrors).length > 0) {
      setBankErrors(newErrors);
      return;
    }

    try {
      setIsBankSaving(true);
      const token = localStorage.getItem('clinicToken');
      await saveClinicBankAccount(token, bankData);
      toast.success('Bank account details saved successfully');
    } catch (err) {
      toast.error(err.message || 'Could not save bank details');
    } finally {
      setIsBankSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="bg-white p-10 rounded-[30px] border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4" style={{ minHeight: 260 }}>
        <div className="w-10 h-10 border-4 border-[#1EBDB8]/20 border-t-[#1EBDB8] rounded-full animate-spin"></div>
        <p className="text-[14px] font-medium text-gray-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Overview Card */}
      <div className="bg-white p-7 rounded-[30px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-7">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-gray-50 flex items-center justify-center">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} alt={formData.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[#1EBDB8] uppercase">{formData.name.charAt(0)}</span>
            )}
            {isAvatarSaving && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-[32px]">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={isAvatarSaving}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-[#6B7280] hover:text-[#1EBDB8] transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-[26px] font-bold text-[#1F2432] tracking-tight">{formData.name}</h2>
          <p className="text-[14px] font-medium text-[#6B7280] flex items-center justify-center md:justify-start gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            {formData.email}
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
            <span className="px-3 py-1 bg-[#1EBDB8]/10 text-[#0F766E] text-[11px] font-bold rounded-full uppercase tracking-wider border border-[#1EBDB8]/20">
              {formData.facilityType || 'Medical Facility'}
            </span>
            <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${
              formData.applicationStatus === 'approved'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {formData.applicationStatus || 'pending'}
            </span>
            {formData.createdAt && (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full uppercase tracking-wider">
                Since {formatDate(formData.createdAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details Form */}
      <form onSubmit={handleSave} className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-gray-50 pb-5">
          <div>
            <h3 className="text-[18px] font-bold text-[#1F2432]">Clinic Details</h3>
            <p className="text-[13px] text-gray-400 font-medium mt-0.5">Keep your facility information accurate and up to date.</p>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#1EBDB8]/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <ClinicProfileField
            label="Clinic / Facility Name"
            value={formData.name}
            onChange={(e) => handleChange(e, 'name')}
            error={errors.name}
            placeholder="Official facility name"
            disabled={isSaving}
          />
          <ClinicProfileField
            label="Contact Number"
            value={formData.phone}
            onChange={(e) => handleChange(e, 'phone')}
            error={errors.phone}
            placeholder="+92 3XX XXXXXXX"
            disabled={isSaving}
          />
          <ClinicProfileField
            label="Email Address"
            value={formData.email}
            readOnly
          />

          {/* Facility Type Dropdown */}
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-[#6B7280]">Facility Type</span>
            <select
              value={formData.facilityType}
              onChange={(e) => handleChange(e, 'facilityType')}
              disabled={isSaving}
              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20 disabled:opacity-70 transition-all"
            >
              <option value="">Select facility type</option>
              {FACILITY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <ClinicProfileField
              label="Physical Address"
              value={formData.address}
              onChange={(e) => handleChange(e, 'address')}
              error={errors.address}
              placeholder="Street address, City, Country"
              disabled={isSaving}
            />
          </div>
        </div>
      </form>

      {/* Bank Account Details */}
      <form onSubmit={handleBankSave} className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm space-y-8 mt-6">
        <div className="flex items-center justify-between border-b border-gray-50 pb-5">
          <div>
            <h3 className="text-[18px] font-bold text-[#1F2432]">Bank Account Details</h3>
            <p className="text-[13px] text-gray-400 font-medium mt-0.5">Where your clinic earnings will be withdrawn</p>
          </div>
          <button
            type="submit"
            disabled={isBankSaving}
            className="px-6 py-2.5 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white text-[13px] font-bold rounded-xl shadow-lg shadow-[#1EBDB8]/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isBankSaving ? 'Saving...' : 'Save Details'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <ClinicProfileField
            label="Account Title"
            value={bankData.accountTitle}
            onChange={(e) => handleBankChange(e, 'accountTitle')}
            error={bankErrors.accountTitle}
            placeholder="E.g., Clinic Name"
            disabled={isBankSaving}
          />
          <ClinicProfileField
            label="Account / IBAN Number"
            value={bankData.accountNumber}
            onChange={(e) => handleBankChange(e, 'accountNumber')}
            error={bankErrors.accountNumber}
            placeholder="PK00 BANK 0000 0000"
            disabled={isBankSaving}
          />
          <div className="md:col-span-2">
            <ClinicProfileField
              label="Bank Name"
              value={bankData.bankName}
              onChange={(e) => handleBankChange(e, 'bankName')}
              error={bankErrors.bankName}
              placeholder="E.g., HBL, Meezan Bank"
              disabled={isBankSaving}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
