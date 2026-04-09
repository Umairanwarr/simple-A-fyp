import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { signInWithPopup } from 'firebase/auth';
import { PasswordField, validateEmail } from './SharedFields';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, googleProvider } from '../../services/firebase';
import {
  loginClinic,
  loginDoctor,
  loginMedicalStore,
  loginPatient,
  loginPatientWithGoogle,
  sendClinicLoginOtp,
  sendMedicalStoreLoginOtp,
  sendDoctorLoginOtp
} from '../../services/authApi';
import { saveSessionUser } from '../../utils/authSession';

export default function SignInForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patient');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPassword, setShowPassword] = useState({});
  const [countdown, setCountdown] = useState(0);
  const [isFirstOTP, setIsFirstOTP] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleResendOTP = () => {
    if (activeTab === 'doctor' || activeTab === 'clinic' || activeTab === 'medical-store') {
      if (!validateEmail(email)) {
        toast.error(`Enter a valid ${activeTab} email before requesting OTP`);
        return;
      }

      setCountdown(60);
      setIsFirstOTP(false);

      const sendOtpPromise = activeTab === 'doctor'
        ? sendDoctorLoginOtp(email)
        : activeTab === 'clinic'
          ? sendClinicLoginOtp(email)
          : sendMedicalStoreLoginOtp(email);

      sendOtpPromise
        .then((data) => {
          toast.success(data.message || 'OTP sent successfully');
        })
        .catch((error) => {
          toast.error(error.message || 'Could not send OTP');
          setCountdown(0);
        });

      return;
    }

    setCountdown(60);
    if(isFirstOTP) setIsFirstOTP(false);
    toast.info(isFirstOTP ? 'OTP Sent!' : 'OTP Resent!');
  };

  const handleCaptchaChange = (value) => {
    setCaptchaVerified(!!value);
  };

  const handleForgotPassword = () => {
    if (!validateEmail(email)) {
      toast.error('Enter your email first to receive reset OTP');
      return;
    }

    navigate(`/verification-code?flow=reset&email=${encodeURIComponent(email.trim().toLowerCase())}&autoSend=1`);
  };

  const isFormValid = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = password.length > 0;

    if (activeTab === 'patient') {
      return isEmailValid && isPasswordValid;
    }

    // For doctor, clinic and medical-store require 2FA + captcha.
    return isEmailValid && isPasswordValid && otp.length === 6 && captchaVerified;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password.length === 0) {
      toast.error('Please enter your password');
      return;
    }
    if (activeTab !== 'patient' && (!captchaVerified || otp.length !== 6)) {
      toast.error('Please complete all security verification steps');
      return;
    }

    if (!['patient', 'doctor', 'clinic', 'medical-store'].includes(activeTab)) {
      navigate('/dashboard');
      return;
    }

    if (activeTab === 'doctor') {
      try {
        setIsSubmitting(true);
        const data = await loginDoctor({ email, password, otp });

        localStorage.setItem('doctorToken', data.token);
        saveSessionUser('doctor', data.doctor);
        toast.success('Login successful!');
        navigate('/doctor/dashboard');
      } catch (error) {
        toast.error(error.message || 'Could not sign in');
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (activeTab === 'clinic') {
      try {
        setIsSubmitting(true);
        const data = await loginClinic({ email, password, otp });

        localStorage.setItem('clinicToken', data.token);
        saveSessionUser('clinic', data.clinic);
        toast.success('Login successful!');
        navigate('/clinic/dashboard');
      } catch (error) {
        toast.error(error.message || 'Could not sign in');
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    if (activeTab === 'medical-store') {
      try {
        setIsSubmitting(true);
        const data = await loginMedicalStore({ email, password, otp });

        localStorage.setItem('medicalStoreToken', data.token);
        saveSessionUser('medicalStore', data.medicalStore);
        toast.success('Login successful!');
        navigate('/store/dashboard');
      } catch (error) {
        toast.error(error.message || 'Could not sign in');
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    try {
      setIsSubmitting(true);
      const data = await loginPatient({ email, password });

      localStorage.setItem('patientToken', data.token);
      saveSessionUser('patient', data.patient);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Could not sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleSubmitting(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const data = await loginPatientWithGoogle(idToken);

      localStorage.setItem('patientToken', data.token);
      saveSessionUser('patient', data.patient);
      toast.success('Google sign-in successful!');
      navigate('/dashboard');
    } catch (error) {
      if (error?.code === 'auth/popup-closed-by-user') {
        toast.info('Google sign-in cancelled');
        return;
      }

      toast.error(error.message || 'Could not sign in with Google');
    } finally {
      setIsGoogleSubmitting(false);
    }
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
      case 'clinic': return 'Clinic Login';
      case 'medical-store': return 'Medical Store Login';
      default: return 'To log in, enter your email address';
    }
  };

  const renderSecurityFields = () => {
    if (activeTab === 'patient') return null;

    return (
      <>
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#6B7280]">Two-Factor Code (2FA)</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter 6-digit 2FA code"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full tracking-widest pr-28"
            />
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0}
              className={`absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#1EBDB8] hover:underline'}`}
            >
              {countdown > 0 ? `${countdown}s` : (isFirstOTP ? 'Send OTP' : 'Resend')}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <label className="text-[13.5px] font-bold text-[#6B7280] mb-2">Security Verification</label>
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
            onChange={handleCaptchaChange}
          />
        </div>
      </>
    );
  };

  return (
    <div className="w-full flex justify-center px-6 py-10 md:py-14 bg-white min-h-[calc(100vh-200px)]">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-[450px]">
        <div className="text-center mb-10">
          <h1 className="text-[34px] sm:text-[40px] text-[#6B7280] font-medium tracking-tight mb-2">
            Welcome <span className="text-[#1EBDB8] font-bold">Back</span>
          </h1>
        </div>

        {/* Custom Tab Navigation that matches SignUp */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCaptchaVerified(false);
                setOtp('');
                setCountdown(0);
                setIsFirstOTP(true);
              }}
              className={`flex-1 min-w-[70px] sm:min-w-[80px] py-2.5 px-2 sm:px-3 flex items-center justify-center rounded-lg text-[13px] sm:text-[14px] font-bold transition-all text-center leading-tight whitespace-normal sm:whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#1EBDB8] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-[20px] sm:text-[24px] font-bold text-[#6B7280] leading-tight mb-2">
            {getTabTitle()}
          </h2>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#6B7280]">
              {activeTab === 'patient' ? 'Email Address' : 'Professional Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email address"
              className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full"
            />
          </div>

          <PasswordField
            id="login-password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPassword={showPassword['login-password']}
            togglePasswordVisibility={togglePasswordVisibility}
          />

          <div className="flex justify-end">
            {activeTab === 'patient' && (
              <button type="button" onClick={handleForgotPassword} className="text-[#1EBDB8] text-[13px] font-bold hover:underline">
                Forgot Password?
              </button>
            )}
          </div>

          {renderSecurityFields()}

          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={`w-full py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm mt-2 ${
              isFormValid() && !isSubmitting
                ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>

          {activeTab === 'patient' && (
            <>
              <div className="flex items-center gap-4 my-2">
                <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
                <span className="text-[#6B7280] text-[13px] font-bold">Or</span>
                <div className="h-[1.5px] flex-1 bg-[#E5E7EB]"></div>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSubmitting || isSubmitting}
                  className={`w-full flex items-center justify-center gap-3 border-[1.5px] py-3.5 rounded-xl font-bold text-[16px] transition-colors shadow-sm ${
                    isGoogleSubmitting || isSubmitting
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-[#E5E7EB] hover:bg-gray-50 text-[#1F2937]'
                  }`}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-[20px] h-[20px]" alt="Google logo" />
                  {isGoogleSubmitting ? 'Please wait...' : 'Continue with Google'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
