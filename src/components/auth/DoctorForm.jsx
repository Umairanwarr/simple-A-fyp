import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PasswordField, FilePicker, validatePassword, validateEmail } from './SharedFields';
import { registerDoctor } from '../../services/authApi';

const specialties = [
  'Cardiologist', 'Dermatologist', 'Endocrinologist', 'Gastroenterologist',
  'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist',
  'Pulmonologist', 'Radiologist', 'Surgeon', 'Urologist'
];

export default function DoctorForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    address: '',
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
    if (e.target.name === 'phone' || e.target.name === 'experience') {
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
      toast.error('Please enter a valid email address');
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
      formPayload.append('fullName', formData.fullName);
      formPayload.append('email', formData.email);
      formPayload.append('phone', formData.phone);
      formPayload.append('specialization', formData.specialization);
      formPayload.append('licenseNumber', formData.licenseNumber);
      formPayload.append('experience', formData.experience);
      formPayload.append('address', formData.address);
      formPayload.append('password', formData.password);
      formPayload.append('confirmPassword', formData.confirmPassword);

      if (formData.licenseMedia) {
        formPayload.append('licenseMedia', formData.licenseMedia);
      }

      await registerDoctor(formPayload);

      toast.success('Details submitted. Please verify your email.');
      navigate(`/verification-code?flow=doctor-signup&email=${encodeURIComponent(formData.email.trim().toLowerCase())}&autoSend=1`);
    } catch (error) {
      toast.error(error.message || 'Could not submit doctor registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormComplete = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'specialization', 'licenseNumber', 'experience', 'address', 'password', 'confirmPassword'];
    return requiredFields.every(field => formData[field]?.trim()) && formData.licenseMedia && captchaVerified;
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Full Professional Name</label>
        <input name="fullName" type="text" placeholder="e.g., Dr. Badar Salar" value={formData.fullName} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Professional Email</label>
        <input name="email" type="email" placeholder="Email for verification" value={formData.email} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Verified Phone Number</label>
        <input name="phone" type="tel" placeholder="Phone number" value={formData.phone} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Specialization</label>
        <select name="specialization" value={formData.specialization} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]">
          <option value="">Select Specialization</option>
          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Medical License Number</label>
        <input name="licenseNumber" type="text" placeholder="e.g., PMDC/PMC ID" value={formData.licenseNumber} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Years of Experience</label>
        <input name="experience" type="number" placeholder="Enter years of experience" value={formData.experience} onChange={handleChange} min="0" className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Clinic/Hospital Address</label>
        <textarea name="address" placeholder="Enter precise location" value={formData.address} onChange={handleChange} className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] min-h-[80px]" />
      </div>

      <FilePicker 
        label="Medical License (PDF/Image)"
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
