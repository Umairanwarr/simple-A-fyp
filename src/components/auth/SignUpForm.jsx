import React, { useState, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GenderModal from './GenderModal';
import DoctorForm from './DoctorForm';
import ClinicForm from './ClinicForm';
import MedicalStoreForm from './MedicalStoreForm';

const specialties = [
  'Cardiologist', 'Dermatologist', 'Endocrinologist', 'Gastroenterologist',
  'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist',
  'Pulmonologist', 'Radiologist', 'Surgeon', 'Urologist'
];

const facilityTypes = [
  'General Hospital', 'Private Clinic', 'Diagnostic Lab', 'Specialty Center',
  'Rehabilitation Center', 'Nursing Home', 'Mental Health Facility'
];

// Password Input Component
const PasswordField = memo(function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  togglePasswordVisibility,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13.5px] font-bold text-[#6B7280]">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full pr-12"
        />
        <button
          type="button"
          onClick={() => togglePasswordVisibility(id)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
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
});

// Patient Form Component
const PatientForm = memo(function PatientForm({
  patientData,
  onPatientSubmit,
  onPatientEmailChange,
  onPatientFirstNameChange,
  onPatientLastNameChange,
  onPatientDobChange,
  onPatientPasswordChange,
  onPatientConfirmPasswordChange,
  isPatientFormComplete,
  setModalOpen,
  showPassword,
  togglePasswordVisibility,
}) {
  return (
    <form className="flex flex-col gap-5" onSubmit={onPatientSubmit}>
      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Email Address</label>
        <input
          type="email"
          placeholder="Enter your Email address"
          value={patientData.email}
          onChange={onPatientEmailChange}
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
            value={patientData.firstName}
            onChange={onPatientFirstNameChange}
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
            value={patientData.lastName}
            onChange={onPatientLastNameChange}
            className="bg-[#F5F5F5E5] rounded-[10px] px-4 py-3.5 sm:py-4 text-[#4B5563] text-[14px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[13.5px] font-bold text-[#6B7280]">Date of birth</label>
        <input
          type="date"
          placeholder="Select date"
          value={patientData.dob}
          onChange={onPatientDobChange}
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

      <PasswordField
        id="patient-password"
        label="Password"
        placeholder="Create a strong password"
        value={patientData.password}
        onChange={onPatientPasswordChange}
        showPassword={showPassword['patient-password']}
        togglePasswordVisibility={togglePasswordVisibility}
      />

      <PasswordField
        id="patient-confirm"
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={patientData.confirmPassword}
        onChange={onPatientConfirmPasswordChange}
        showPassword={showPassword['patient-confirm']}
        togglePasswordVisibility={togglePasswordVisibility}
      />
      <p className="text-[#9CA3AF] text-[12px] mt-1">
        Password must be at least 9 characters with 1 uppercase letter and 1 special character
      </p>

      <button 
        type="submit" 
        disabled={!isPatientFormComplete()}
        className={`w-full py-4 rounded-full font-bold text-[15px] transition-colors shadow-sm mt-3 ${
          isPatientFormComplete()
            ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Sign Up
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
});

// Main Component
export default function SignUpForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patient');
  const [isModalOpen, setModalOpen] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const recaptchaRef = useRef(null);
  const [showPassword, setShowPassword] = useState({});

  // Form data states
  const [patientData, setPatientData] = useState({
    email: '', firstName: '', lastName: '', dob: '', password: '', confirmPassword: ''
  });

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const showFieldError = useCallback((fieldName) => {
    toast.error(`${fieldName} is required`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }, []);

  const handleCaptchaChange = useCallback((value) => {
    setCaptchaVerified(!!value);
  }, []);

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
      case 'clinic': return 'Clinic Registration';
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

  const isPatientFormComplete = () => {
    return patientData.email.trim() && 
           patientData.firstName.trim() && 
           patientData.lastName.trim() && 
           patientData.dob.trim() && 
           patientData.password.trim() && 
           patientData.confirmPassword.trim();
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 9;
    return hasUpperCase && hasSpecialChar && hasMinLength;
  };

  const onPatientEmailChange = useCallback((e) => {
    setPatientData(prev => ({ ...prev, email: e.target.value }));
  }, []);

  const onPatientFirstNameChange = useCallback((e) => {
    setPatientData(prev => ({ ...prev, firstName: e.target.value }));
  }, []);

  const onPatientLastNameChange = useCallback((e) => {
    setPatientData(prev => ({ ...prev, lastName: e.target.value }));
  }, []);

  const onPatientDobChange = useCallback((e) => {
    setPatientData(prev => ({ ...prev, dob: e.target.value }));
  }, []);

  const onPatientPasswordChange = useCallback((e) => {
    setPatientData(prev => ({ ...prev, password: e.target.value }));
  }, []);

  const onPatientConfirmPasswordChange = useCallback((e) => {
    setPatientData(prev => ({ ...prev, confirmPassword: e.target.value }));
  }, []);

  const onPatientSubmit = useCallback((e) => {
    e.preventDefault();
    const missing = [];
    if (!patientData.email.trim()) missing.push('Email Address');
    if (!patientData.firstName.trim()) missing.push('First Legal Name');
    if (!patientData.lastName.trim()) missing.push('Last Legal Name');
    if (!patientData.dob.trim()) missing.push('Date of Birth');
    if (!patientData.password.trim()) missing.push('Password');
    if (!patientData.confirmPassword.trim()) missing.push('Confirm Password');

    if (missing.length > 0) {
      missing.forEach(field => showFieldError(field));
      return;
    }

    if (patientData.password !== patientData.confirmPassword) {
      toast.error('Passwords do not match', { position: "top-right", autoClose: 3000 });
      return;
    }

    if (!validatePassword(patientData.password)) {
      toast.error('Password must be at least 9 characters with 1 uppercase letter and 1 special character', {
        position: "top-right", autoClose: 3000,
      });
      return;
    }

    const selectedDate = new Date(patientData.dob);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      toast.error('Date of birth cannot be in the future', { position: "top-right", autoClose: 3000 });
      return;
    }

    const minAge = 18;
    const birthDate = new Date(patientData.dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    if (actualAge < minAge) {
      toast.error('You must be at least 18 years old to register', { position: "top-right", autoClose: 3000 });
      return;
    }

    navigate('/verification?flow=signup');
  }, [navigate, patientData, showFieldError]);

  return (
    <div className="w-full flex justify-center px-6 py-10 md:py-16 bg-white min-h-[calc(100vh-200px)]">
      <ToastContainer />
      <div className="w-full max-w-[500px]">
        <GenderModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        
        <div className="text-center mb-8">
          <h1 className="text-[34px] sm:text-[40px] text-[#6B7280] font-medium tracking-tight mb-2">
            Create an <span className="text-[#1EBDB8] font-bold">Account</span>
          </h1>
        </div>

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

        {activeTab === 'patient' && (
          <PatientForm 
            patientData={patientData}
            onPatientSubmit={onPatientSubmit}
            onPatientEmailChange={onPatientEmailChange}
            onPatientFirstNameChange={onPatientFirstNameChange}
            onPatientLastNameChange={onPatientLastNameChange}
            onPatientDobChange={onPatientDobChange}
            onPatientPasswordChange={onPatientPasswordChange}
            onPatientConfirmPasswordChange={onPatientConfirmPasswordChange}
            isPatientFormComplete={isPatientFormComplete}
            setModalOpen={setModalOpen}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        )}
        
        {activeTab === 'doctor' && <DoctorForm />}
        {activeTab === 'clinic' && <ClinicForm />}
        {activeTab === 'medical-store' && <MedicalStoreForm />}

      </div>
    </div>
  );
}
