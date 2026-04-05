import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import GenderModal from './GenderModal';

const specialties = [
  'Cardiologist', 'Dermatologist', 'Endocrinologist', 'Gastroenterologist',
  'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist',
  'Pulmonologist', 'Radiologist', 'Surgeon', 'Urologist'
];

const facilityTypes = [
  'General Hospital', 'Private Clinic', 'Diagnostic Lab', 'Specialty Center',
  'Rehabilitation Center', 'Nursing Home', 'Mental Health Facility'
];

export default function SignUpForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patient');
  const [isModalOpen, setModalOpen] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const recaptchaRef = useRef(null);
  const [showPassword, setShowPassword] = useState({});

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const PasswordInput = ({ id, label, placeholder }) => (
    <div className="flex flex-col gap-2">
      <label className="text-[13.5px] font-bold text-[#6B7280]">{label}</label>
      <div className="relative">
        <input
          type={showPassword[id] ? 'text' : 'password'}
          placeholder={placeholder}
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full pr-12"
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(id)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword[id] ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  const handleCaptchaChange = (value) => {
    setCaptchaVerified(!!value);
  };

  const tabs = [
    { id: 'patient', label: 'Patient' },
    { id: 'doctor', label: 'Doctor' },
    { id: 'clinic', label: 'Clinic' },
    { id: 'medical-store', label: 'Medical Store' }
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'patient': return 'Tell us about yourself';
      case 'doctor': return 'Doctor Registration';
      case 'clinic': return 'Clinic/Hospital Registration';
      case 'medical-store': return 'Medical Store Registration';
      default: return 'Tell us about yourself';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'patient': return 'To book your appointment, we need to verify a few things';
      case 'doctor': return 'Join our network of healthcare professionals';
      case 'clinic': return 'Register your facility to reach more patients';
      case 'medical-store': return 'Start selling medicines to local customers';
      default: return '';
    }
  };

  // Patient Form
  const PatientForm = () => (
    <form className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Email Address</label>
        <input 
          type="email" 
          placeholder="Enter your Email address" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#6B7280]">
            First Legal Name
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </label>
          <input 
            type="text" 
            placeholder="Enter your First name" 
            className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-1.5 text-[13.5px] font-bold text-[#6B7280]">
            Last Legal Name
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 mt-0.5">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </label>
          <input 
            type="text" 
            placeholder="Enter your last name" 
            className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Date of birth</label>
        <input 
          type="text" 
          placeholder="mm/dd/yy" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-3 mt-1 mb-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Gender</label>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-[#1F2937] flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-[#1F2937] rounded-full hidden group-has-[:checked]:block"></div>
            </div>
            <input type="radio" name="gender" value="male" className="hidden" defaultChecked />
            <span className="text-[#4B5563] text-[14.5px] font-medium leading-none mt-0.5">Male</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group w-fit">
            <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-[#4B5563] group-has-[:checked]:border-[#1F2937] flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-[#1F2937] rounded-full hidden group-has-[:checked]:block"></div>
            </div>
            <input type="radio" name="gender" value="female" className="hidden" />
            <span className="text-[#4B5563] text-[14.5px] font-medium leading-none mt-0.5">Female</span>
          </label>
        </div>
        
        <button 
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-[#1F2937] text-[13px] font-bold underline decoration-2 underline-offset-4 mt-2 text-left"
        >
          Add more sex and gender info <span className="font-medium text-[#6B7280] no-underline">(optional)</span>
        </button>
      </div>

      <PasswordInput id="patient-password" label="Password" placeholder="Create a strong password" />
      <PasswordInput id="patient-confirm" label="Confirm Password" placeholder="Re-enter your password" />

      <button type="button" onClick={() => navigate('/verification?flow=signup')} className="w-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white py-4 rounded-full font-bold text-[15px] transition-colors shadow-sm mt-3">
        Continue
      </button>
      
      <div className="flex items-center gap-4 my-2">
        <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
        <span className="text-[#6B7280] text-[13px] font-bold">Or</span>
        <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
      </div>
      
      <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border-[1.5px] border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] py-3.5 rounded-xl font-bold text-[15.5px] transition-colors shadow-sm">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-[22px] h-[22px]" alt="Google logo"/>
        Continue with Google
      </button>
    </form>
  );

  // Doctor Form
  const DoctorForm = () => (
    <form className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Full Professional Name</label>
        <input 
          type="text" 
          placeholder="e.g., Dr. Badar Salar" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Professional Email</label>
        <input 
          type="email" 
          placeholder="For verification code/OTP" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Verified Phone Number</label>
        <input 
          type="tel" 
          placeholder="For identity and two-step verification" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Specialization</label>
        <select className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] cursor-pointer">
          <option value="">Select your specialization</option>
          {specialties.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Medical License Number</label>
        <input 
          type="text" 
          placeholder="PMDC/PMC registration number" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-[13.5px] font-bold text-[#6B7280]">Years of Experience</label>
          <input 
            type="number" 
            min="0"
            placeholder="e.g., 5" 
            className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[13.5px] font-bold text-[#6B7280]">Clinic/Hospital Address</label>
          <input 
            type="text" 
            placeholder="Precise location" 
            className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
          />
        </div>
      </div>

      <PasswordInput id="doctor-password" label="Password" placeholder="Create a secure password" />
      <PasswordInput id="doctor-confirm" label="Confirm Password" placeholder="Re-enter your password" />

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Medical License Upload (PDF/Image)</label>
        <div className="relative">
          <input 
            type="file" 
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden" 
            id="doctor-license"
          />
          <label 
            htmlFor="doctor-license" 
            className="flex items-center gap-3 bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#9CA3AF] text-[14px] font-medium cursor-pointer hover:bg-[#E5E7EB] transition-all border border-transparent border-dashed border-[#9CA3AF]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload medical license (Required)
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="text-[13.5px] font-bold text-[#6B7280] mb-2">Security Verification</label>
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onChange={handleCaptchaChange}
          ref={recaptchaRef}
        />
      </div>

      <button 
        type="button" 
        onClick={() => navigate('/verification?flow=signup')} 
        disabled={!captchaVerified}
        className={`w-full py-4 rounded-full font-bold text-[15px] transition-colors shadow-sm mt-3 ${
          captchaVerified 
            ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Submit for Verification
      </button>
    </form>
  );

  // Clinic Form
  const ClinicForm = () => (
    <form className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Clinic/Hospital Name</label>
        <input 
          type="text" 
          placeholder="Official registered title" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Administrator Email</label>
        <input 
          type="email" 
          placeholder="For secure management and verification" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Official Phone Number</label>
        <input 
          type="tel" 
          placeholder="For patient contact and identity" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Facility Type</label>
        <select className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] cursor-pointer">
          <option value="">Select facility type</option>
          {facilityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Complete Physical Address</label>
        <textarea 
          placeholder="For GPS-based search results and Near Me engine" 
          rows="3"
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] resize-none"
        />
      </div>

      <PasswordInput id="clinic-password" label="Password" placeholder="Create a secure password" />
      <PasswordInput id="clinic-confirm" label="Confirm Password" placeholder="Re-enter your password" />

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Health Permit Upload (PDF/Image)</label>
        <div className="relative">
          <input 
            type="file" 
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden" 
            id="clinic-permit"
          />
          <label 
            htmlFor="clinic-permit" 
            className="flex items-center gap-3 bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#9CA3AF] text-[14px] font-medium cursor-pointer hover:bg-[#E5E7EB] transition-all border border-transparent border-dashed border-[#9CA3AF]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload health permit (Required)
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="text-[13.5px] font-bold text-[#6B7280] mb-2">Security Verification</label>
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onChange={handleCaptchaChange}
        />
      </div>

      <button 
        type="button" 
        onClick={() => navigate('/verification?flow=signup')} 
        disabled={!captchaVerified}
        className={`w-full py-4 rounded-full font-bold text-[15px] transition-colors shadow-sm mt-3 ${
          captchaVerified 
            ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Submit for Verification
      </button>
    </form>
  );

  // Medical Store Form
  const MedicalStoreForm = () => (
    <form className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Store Name</label>
        <input 
          type="text" 
          placeholder="Official pharmacy or medical store title" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Owner/Proprietor Email</label>
        <input 
          type="email" 
          placeholder="For mandatory OTP/Verification" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Contact Phone Number</label>
        <input 
          type="tel" 
          placeholder="For delivery logistics and identity" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Pharmacy License Number</label>
        <input 
          type="text" 
          placeholder="Drug regulatory authority ID" 
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Store Physical Address</label>
        <textarea 
          placeholder="For local delivery area and location-based discovery" 
          rows="3"
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-[13.5px] font-bold text-[#6B7280]">Opening Time</label>
          <input 
            type="time" 
            className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[13.5px] font-bold text-[#6B7280]">Closing Time</label>
          <input 
            type="time" 
            className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
          />
        </div>
      </div>

      <PasswordInput id="store-password" label="Password" placeholder="Create a secure password" />
      <PasswordInput id="store-confirm" label="Confirm Password" placeholder="Re-enter your password" />

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Pharmacy License Upload (PDF/Image)</label>
        <div className="relative">
          <input 
            type="file" 
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden" 
            id="pharmacy-license"
          />
          <label 
            htmlFor="pharmacy-license" 
            className="flex items-center gap-3 bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#9CA3AF] text-[14px] font-medium cursor-pointer hover:bg-[#E5E7EB] transition-all border border-transparent border-dashed border-[#9CA3AF]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload pharmacy license (Required)
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="text-[13.5px] font-bold text-[#6B7280] mb-2">Security Verification</label>
        <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onChange={handleCaptchaChange}
        />
      </div>

      <button 
        type="button" 
        onClick={() => navigate('/verification?flow=signup')} 
        disabled={!captchaVerified}
        className={`w-full py-4 rounded-full font-bold text-[15px] transition-colors shadow-sm mt-3 ${
          captchaVerified 
            ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Submit for Verification
      </button>
    </form>
  );

  const renderForm = () => {
    switch (activeTab) {
      case 'patient': return <PatientForm />;
      case 'doctor': return <DoctorForm />;
      case 'clinic': return <ClinicForm />;
      case 'medical-store': return <MedicalStoreForm />;
      default: return <PatientForm />;
    }
  };

  return (
    <div className="w-full flex justify-center px-6 py-10 md:py-16 bg-white min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-[500px]">
        <GenderModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        
        <div className="text-center mb-8">
          <h1 className="text-[34px] sm:text-[40px] text-[#6B7280] font-medium tracking-tight mb-2">
            Create an <span className="text-[#1EBDB8] font-bold">Account</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-lg text-[13px] font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-[#1EBDB8] shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#6B7280] leading-tight">
            {getTabTitle()}
          </h2>
          <p className="text-[#9CA3AF] text-[13.5px] sm:text-[14px] font-medium mt-1">
            {getTabSubtitle()}
          </p>
        </div>

        {renderForm()}
      </div>
    </div>
  );
}
