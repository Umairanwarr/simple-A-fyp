import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PasswordField, FilePicker, validatePassword, validateEmail } from './SharedFields';
import { registerClinic } from '../../services/authApi';

const facilityTypes = [
  'General Hospital', 'Private Clinic', 'Diagnostic Lab', 'Specialty Center',
  'Rehabilitation Center', 'Nursing Home', 'Mental Health Facility'
];

export default function ClinicForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    facilityType: '',
    address: '',
    password: '',
    confirmPassword: '',
    permitMedia: null,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid administrator email address');
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

    try {
      setIsSubmitting(true);

      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('email', formData.email);
      formPayload.append('phone', formData.phone);
      formPayload.append('facilityType', formData.facilityType);
      formPayload.append('address', formData.address);
      formPayload.append('password', formData.password);
      formPayload.append('confirmPassword', formData.confirmPassword);

      if (formData.permitMedia) {
        formPayload.append('permitMedia', formData.permitMedia);
      }

      await registerClinic(formPayload);

      toast.success('Clinic details submitted. Please verify your email.');
      navigate(`/verification-code?flow=clinic-signup&email=${encodeURIComponent(formData.email.trim().toLowerCase())}&autoSend=1`);
    } catch (error) {
      toast.error(error.message || 'Could not submit clinic registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormComplete = () => {
    const requiredFields = ['name', 'email', 'phone', 'facilityType', 'address', 'password', 'confirmPassword'];
    return requiredFields.every(field => formData[field]?.trim()) && formData.permitMedia && captchaVerified;
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Clinic Name</label>
        <input name="name" type="text" placeholder="Official registered title" value={formData.name} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Administrator Email</label>
        <input name="email" type="email" placeholder="For secure management" value={formData.email} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Official Phone Number</label>
        <input name="phone" type="tel" placeholder="Required for patient contact" value={formData.phone} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Facility Type</label>
        <select name="facilityType" value={formData.facilityType} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]">
          <option value="">Select Facility Type</option>
          {facilityTypes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Complete Physical Address</label>
        <textarea name="address" placeholder="For GPS-based search results" value={formData.address} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] min-h-[80px]" />
      </div>

      <FilePicker 
        label="Health Permit (PDF/Image)"
        name="permitMedia"
        file={formData.permitMedia}
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
