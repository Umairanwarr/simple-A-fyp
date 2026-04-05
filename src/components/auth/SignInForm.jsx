import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

export default function SignInForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patient');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendOTP = () => {
    setCountdown(60);
  };

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
      case 'patient': return 'To log in, enter your email address';
      case 'doctor': return 'Doctor Login';
      case 'clinic': return 'Clinic/Hospital Login';
      case 'medical-store': return 'Medical Store Login';
      default: return 'To log in, enter your email address';
    }
  };

  // Patient Form (original simple email flow)
  const PatientForm = () => (
    <form className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Email Address</label>
        <input
          type="email"
          placeholder="Enter your email address"
          className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={() => navigate('/verification')} className="text-[#1EBDB8] text-[13px] font-bold hover:underline">
          Forgot Password?
        </button>
      </div>

      <div className="flex flex-col gap-6 mt-2">
        <button
          type="button"
          onClick={() => navigate('/verification')}
          className="w-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm"
        >
          Sign In
        </button>

        <div className="flex items-center gap-4 my-2">
          <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
          <span className="text-[#6B7280] text-[13px] font-bold">Or</span>
          <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
        </div>

        <div className="flex flex-col gap-4">
          <button type="button" className="w-full flex items-center justify-center gap-3 bg-white border-[1.5px] border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937] py-3.5 rounded-xl font-bold text-[16px] transition-colors shadow-sm">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-[20px] h-[20px]" alt="Google logo" />
            Continue with Google
          </button>
        </div>
      </div>
    </form>
  );

  // Doctor Form
  const DoctorForm = () => (
    <form className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Professional Email</label>
        <input
          type="email"
          placeholder="Enter your registered professional email"
          className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Two-Factor Code (2FA)</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter 6-digit 2FA code"
            maxLength="6"
            className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full tracking-widest pr-28"
          />
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#1EBDB8] hover:underline'}`}
          >
            {countdown > 0 ? `${countdown}s` : 'Resend'}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={() => navigate('/verification')} className="text-[#1EBDB8] text-[13px] font-bold hover:underline">
          Forgot Password?
        </button>
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
        onClick={() => navigate('/verification')}
        disabled={!captchaVerified}
        className={`w-full py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm ${
          captchaVerified
            ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Sign In
      </button>
    </form>
  );

  // Clinic Form
  const ClinicForm = () => (
    <form className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Admin Email</label>
        <input
          type="email"
          placeholder="Enter admin email address"
          className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter secure facility password"
            className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Two-Factor Code (2FA)</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter 6-digit 2FA code"
            maxLength="6"
            className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full tracking-widest pr-28"
          />
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#1EBDB8] hover:underline'}`}
          >
            {countdown > 0 ? `${countdown}s` : 'Resend'}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={() => navigate('/verification')} className="text-[#1EBDB8] text-[13px] font-bold hover:underline">
          Forgot Password?
        </button>
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
        onClick={() => navigate('/verification')}
        disabled={!captchaVerified}
        className={`w-full py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm ${
          captchaVerified
            ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Sign In
      </button>
    </form>
  );

  // Medical Store Form
  const MedicalStoreForm = () => (
    <form className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Registered Email</label>
        <input
          type="email"
          placeholder="Enter your registered business email"
          className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#6B7280]">OTP Verification</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter OTP sent to your email/phone"
            maxLength="6"
            className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full tracking-widest pr-28"
          />
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#1EBDB8] hover:underline'}`}
          >
            {countdown > 0 ? `${countdown}s` : 'Resend'}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={() => navigate('/verification')} className="text-[#1EBDB8] text-[13px] font-bold hover:underline">
          Forgot Password?
        </button>
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
        onClick={() => navigate('/verification')}
        disabled={!captchaVerified}
        className={`w-full py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm ${
          captchaVerified
            ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Sign In
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
    <div className="w-full flex-grow flex items-center justify-center py-10 px-6 bg-white min-h-[calc(100vh-250px)]">
      <div className="w-full max-w-[500px]">
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

        <h1 className="text-[32px] md:text-[36px] font-bold text-[#1F2937] tracking-tight mb-10">
          {getTabTitle()}
        </h1>

        {renderForm()}
      </div>
    </div>
  );
}
