import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PasswordField, FilePicker, validatePassword, validateEmail } from './SharedFields';
import { registerMedicalStore } from '../../services/authApi';

export default function MedicalStoreForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    address: '',
    operatingFrom: '',
    operatingTo: '',
    password: '',
    confirmPassword: '',
    licenseMedia: null,
  });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'phone') {
      value = value.replace(/[^0-9+]/g, '');
    }
    setFormData({ ...formData, [e.target.name]: value });
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    }
  };

  const formatTimeLabel = (timeValue) => {
    const [hoursText, minutesText] = String(timeValue || '').split(':');
    const hours = Number(hoursText);
    const minutes = Number(minutesText);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return '';
    }

    const meridiem = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 || 12;
    return `${twelveHour}:${String(minutes).padStart(2, '0')} ${meridiem}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid owner email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 9 characters with 1 uppercase letter and 1 special character');
      return;
    }

    if (!captchaVerified) {
      toast.error('Please complete the Captcha verification');
      return;
    }

    if (!formData.operatingFrom || !formData.operatingTo) {
      toast.error('Please select operating hours (from and to)');
      return;
    }

    if (formData.operatingTo <= formData.operatingFrom) {
      toast.error('Closing time must be later than opening time');
      return;
    }

    try {
      setIsSubmitting(true);

      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('phone', formData.phone);
      formPayload.append('licenseNumber', formData.licenseNumber);
      formPayload.append('address', formData.address);
      formPayload.append(
        'operatingHours',
        `${formatTimeLabel(formData.operatingFrom)} - ${formatTimeLabel(formData.operatingTo)}`
      );
      formPayload.append('password', formData.password);
      formPayload.append('confirmPassword', formData.confirmPassword);

      if (formData.licenseMedia) {
        formPayload.append('licenseMedia', formData.licenseMedia);
      }

      await registerMedicalStore(formPayload);

      toast.success('Medical store details submitted. Please verify your email.');
      navigate(`/verification-code?flow=medical-store-signup&email=${encodeURIComponent(formData.email.trim().toLowerCase())}&autoSend=1`);
    } catch (error) {
      toast.error(error.message || 'Could not submit medical store registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormComplete = () => {
    const requiredFields = ['name', 'email', 'phone', 'licenseNumber', 'address', 'operatingFrom', 'operatingTo', 'password', 'confirmPassword'];
    return requiredFields.every(field => formData[field]?.trim()) && formData.licenseMedia && captchaVerified;
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Store Name</label>
        <input name="name" type="text" placeholder="Official pharmacy or store title" value={formData.name} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Owner/Proprietor Email</label>
        <input name="email" type="email" placeholder="Unique email for OTP verification" value={formData.email} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Contact Phone Number</label>
        <input name="phone" type="tel" placeholder="For delivery logistics and identity" value={formData.phone} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Pharmacy License Number</label>
        <input name="licenseNumber" type="text" placeholder="Drug regulatory authority ID" value={formData.licenseNumber} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Store Physical Address</label>
        <textarea name="address" placeholder="For local delivery area and discovery" value={formData.address} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] min-h-[80px]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Operating Hours</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[#6B7280]">From</span>
            <input
              name="operatingFrom"
              type="time"
              value={formData.operatingFrom}
              onChange={handleChange}
              className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-semibold text-[#6B7280]">To</span>
            <input
              name="operatingTo"
              type="time"
              value={formData.operatingTo}
              onChange={handleChange}
              className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
            />
          </div>
        </div>
      </div>

      <FilePicker 
        label="Pharmacy License (PDF/Image)"
        name="licenseMedia"
        file={formData.licenseMedia}
        onChange={handleFileChange}
      />

      <PasswordField
        id="password"
        label="Password"
        placeholder="Create a strong password"
        value={formData.password}
        onChange={handleChange}
        showPassword={showPassword['password']}
        togglePasswordVisibility={togglePasswordVisibility}
      />

      <PasswordField
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={handleChange}
        showPassword={showPassword['confirmPassword']}
        togglePasswordVisibility={togglePasswordVisibility}
      />
      <p className="text-[#9CA3AF] text-[12px] mt-1 -mb-2">
        Password must be at least 9 characters with 1 uppercase letter and 1 special character
      </p>

      <div className="mt-4">
        <ReCAPTCHA sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" onChange={(val) => setCaptchaVerified(!!val)} />
      </div>

      <button type="submit" disabled={!isFormComplete() || isSubmitting} className={`w-full py-4 rounded-full font-bold text-[15px] transition-colors shadow-sm mt-3 ${isFormComplete() && !isSubmitting ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
        {isSubmitting ? 'Submitting...' : 'Verify & Submit for Admin Approval'}
      </button>
    </form>
  );
}
