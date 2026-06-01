import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  loginClinic,
  loginDoctor,
  loginMedicalStore,
  sendClinicLoginOtp,
  sendClinicOtp,
  sendDoctorLoginOtp,
  sendMedicalStoreOtp,
  sendMedicalStoreLoginOtp,
  verifyClinicOtp,
  verifyMedicalStoreOtp,
  sendDoctorOtp,
  sendPatientOtp,
  verifyDoctorOtp,
  verifyPatientOtp
} from '../../services/authApi';
import { saveSessionUser } from '../../utils/authSession';

export default function VerificationCodeForm() {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flow = searchParams.get('flow') || 'reset';
  const email = searchParams.get('email') || '';
  const autoSend = searchParams.get('autoSend') === '1';
  const otpAlreadySent = searchParams.get('sent') === '1';
  const isPatientSignupFlow = flow === 'signup';
  const isDoctorSignupFlow = flow === 'doctor-signup';
  const isClinicSignupFlow = flow === 'clinic-signup';
  const isMedicalStoreSignupFlow = flow === 'medical-store-signup';
  const isDoctorLoginFlow = flow === 'doctor-login';
  const isClinicLoginFlow = flow === 'clinic-login';
  const isMedicalStoreLoginFlow = flow === 'medical-store-login';
  const isDoctorResetFlow = flow === 'doctor-reset';
  const isClinicResetFlow = flow === 'clinic-reset';
  const isMedicalStoreResetFlow = flow === 'medical-store-reset';
  const isResetFlow =
    flow === 'reset' ||
    isDoctorResetFlow ||
    isClinicResetFlow ||
    isMedicalStoreResetFlow;
  const isLogin2faFlow = isDoctorLoginFlow || isClinicLoginFlow || isMedicalStoreLoginFlow;
  const hasAutoSentRef = useRef(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (otpAlreadySent) {
      setCountdown(60);
    }
  }, [otpAlreadySent]);

  const getPendingLoginPassword = useCallback(() => {
    const raw = sessionStorage.getItem('pendingLogin2fa');
    if (!raw) {
      throw new Error('Login session expired. Please sign in again.');
    }

    const pending = JSON.parse(raw);
    const pendingPassword = String(pending?.password || '');
    const pendingEmail = String(pending?.email || '').trim().toLowerCase();
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!pendingPassword || pendingEmail !== normalizedEmail) {
      throw new Error('Login session mismatch. Please sign in again.');
    }

    return pendingPassword;
  }, [email]);

  useEffect(() => {
    const sendInitialOtp = async () => {
      if (!autoSend || hasAutoSentRef.current) {
        return;
      }

      if (!email) {
        toast.error('Missing email. Please go back and try again.');
        return;
      }

      hasAutoSentRef.current = true;

      try {
        setIsResending(true);

        if (isDoctorSignupFlow) {
          await sendDoctorOtp(email);
        } else if (isDoctorResetFlow) {
          await sendDoctorOtp(email, 'reset');
        } else if (isDoctorLoginFlow) {
          await sendDoctorLoginOtp({ email, password: getPendingLoginPassword() });
        } else if (isClinicSignupFlow) {
          await sendClinicOtp(email);
        } else if (isClinicResetFlow) {
          await sendClinicOtp(email, 'reset');
        } else if (isClinicLoginFlow) {
          await sendClinicLoginOtp({ email, password: getPendingLoginPassword() });
        } else if (isMedicalStoreSignupFlow) {
          await sendMedicalStoreOtp(email);
        } else if (isMedicalStoreResetFlow) {
          await sendMedicalStoreOtp(email, 'reset');
        } else if (isMedicalStoreLoginFlow) {
          await sendMedicalStoreLoginOtp({ email, password: getPendingLoginPassword() });
        } else {
          await sendPatientOtp(email, isPatientSignupFlow ? 'signup' : 'reset');
        }

        setCountdown(60);
        toast.success('Verification code sent to your email');
      } catch (error) {
        toast.error(error.message || 'Could not send verification code');
      } finally {
        setIsResending(false);
      }
    };

    sendInitialOtp();
  }, [
    autoSend,
    email,
    getPendingLoginPassword,
    isClinicLoginFlow,
    isClinicResetFlow,
    isClinicSignupFlow,
    isDoctorLoginFlow,
    isDoctorResetFlow,
    isDoctorSignupFlow,
    isMedicalStoreLoginFlow,
    isMedicalStoreResetFlow,
    isMedicalStoreSignupFlow,
    isPatientSignupFlow
  ]);

  useEffect(() => {
    if (!isLogin2faFlow) return;

    const raw = sessionStorage.getItem('pendingLogin2fa');
    if (!raw) {
      toast.error('Login session expired. Please sign in again.');
      navigate('/signin');
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const pendingRole = String(parsed?.role || '').trim();
      const pendingEmail = String(parsed?.email || '').trim().toLowerCase();
      const expectedRole = isDoctorLoginFlow ? 'doctor' : isClinicLoginFlow ? 'clinic' : 'medical-store';
      const expectedEmail = String(email || '').trim().toLowerCase();

      if (!pendingRole || !pendingEmail || !parsed?.password || pendingRole !== expectedRole || pendingEmail !== expectedEmail) {
        sessionStorage.removeItem('pendingLogin2fa');
        toast.error('Login session mismatch. Please sign in again.');
        navigate('/signin');
      }
    } catch {
      sessionStorage.removeItem('pendingLogin2fa');
      toast.error('Login session invalid. Please sign in again.');
      navigate('/signin');
    }
  }, [email, isClinicLoginFlow, isDoctorLoginFlow, isLogin2faFlow, navigate]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) {
      return;
    }

    if (!email) {
      toast.error('Missing email. Please go back and try again.');
      return;
    }

    try {
      setIsResending(true);

      if (isDoctorSignupFlow) {
        await sendDoctorOtp(email);
      } else if (isDoctorResetFlow) {
        await sendDoctorOtp(email, 'reset');
      } else if (isDoctorLoginFlow) {
        await sendDoctorLoginOtp({ email, password: getPendingLoginPassword() });
      } else if (isClinicSignupFlow) {
        await sendClinicOtp(email);
      } else if (isClinicResetFlow) {
        await sendClinicOtp(email, 'reset');
      } else if (isClinicLoginFlow) {
        await sendClinicLoginOtp({ email, password: getPendingLoginPassword() });
      } else if (isMedicalStoreSignupFlow) {
        await sendMedicalStoreOtp(email);
      } else if (isMedicalStoreResetFlow) {
        await sendMedicalStoreOtp(email, 'reset');
      } else if (isMedicalStoreLoginFlow) {
        await sendMedicalStoreLoginOtp({ email, password: getPendingLoginPassword() });
      } else {
        await sendPatientOtp(email, isPatientSignupFlow ? 'signup' : 'reset');
      }

      setCountdown(60);
      toast.success('Verification code resent successfully!');
    } catch (error) {
      toast.error(error.message || 'Could not resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) {
      return;
    }

    if (!email) {
      toast.error('Missing email. Please go back and try again.');
      return;
    }

    try {
      setIsSubmitting(true);
      let data;

      if (isDoctorLoginFlow || isClinicLoginFlow || isMedicalStoreLoginFlow) {
        const raw = sessionStorage.getItem('pendingLogin2fa');
        if (!raw) {
          throw new Error('Login session expired. Please sign in again.');
        }

        const pending = JSON.parse(raw);
        const pendingPassword = String(pending?.password || '');
        const pendingEmail = String(pending?.email || '').trim().toLowerCase();
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!pendingPassword || pendingEmail !== normalizedEmail) {
          throw new Error('Login session mismatch. Please sign in again.');
        }

        if (isDoctorLoginFlow) {
          data = await loginDoctor({ email: normalizedEmail, password: pendingPassword, otp });
          localStorage.setItem('doctorToken', data.token);
          saveSessionUser('doctor', data.doctor);
        } else if (isClinicLoginFlow) {
          data = await loginClinic({ email: normalizedEmail, password: pendingPassword, otp });
          localStorage.setItem('clinicToken', data.token);
          saveSessionUser('clinic', data.clinic);
        } else {
          data = await loginMedicalStore({ email: normalizedEmail, password: pendingPassword, otp });
          localStorage.setItem('medicalStoreToken', data.token);
          saveSessionUser('medicalStore', data.medicalStore);
        }
      } else if (isDoctorResetFlow) {
        data = await verifyDoctorOtp({ email, otp, purpose: 'reset' });
      } else if (isClinicResetFlow) {
        data = await verifyClinicOtp({ email, otp, purpose: 'reset' });
      } else if (isMedicalStoreResetFlow) {
        data = await verifyMedicalStoreOtp({ email, otp, purpose: 'reset' });
      } else if (isDoctorSignupFlow) {
        data = await verifyDoctorOtp({ email, otp });
      } else if (isClinicSignupFlow) {
        data = await verifyClinicOtp({ email, otp });
      } else if (isMedicalStoreSignupFlow) {
        data = await verifyMedicalStoreOtp({ email, otp });
      } else {
        data = await verifyPatientOtp({
          email,
          otp,
          purpose: isPatientSignupFlow ? 'signup' : 'reset'
        });
      }

      if (isDoctorSignupFlow) {
        sessionStorage.setItem(
          'doctorApplicationNotice',
          JSON.stringify({
            title: 'Application Submitted',
            message:
              'Your doctor request has been submitted. Admin will review your profile and you will receive an email when your application is approved or declined.'
          })
        );
      }

      if (isClinicSignupFlow) {
        sessionStorage.setItem(
          'clinicApplicationNotice',
          JSON.stringify({
            title: 'Application Submitted',
            message:
              'Your clinic request has been submitted. Admin will review your profile and you will receive an email when your application is approved or declined.'
          })
        );
      }

      if (isMedicalStoreSignupFlow) {
        sessionStorage.setItem(
          'medicalStoreApplicationNotice',
          JSON.stringify({
            title: 'Application Submitted',
            message:
              'Your medical store request has been submitted. Admin will review your profile and you will receive an email when your application is approved or declined.'
          })
        );
      }

      toast.success(
        isDoctorLoginFlow || isClinicLoginFlow || isMedicalStoreLoginFlow
          ? 'Login successful!'
          : isDoctorSignupFlow
          ? 'Verification successful! Application submitted.'
          : isClinicSignupFlow
            ? 'Verification successful! Application submitted.'
          : isMedicalStoreSignupFlow
            ? 'Verification successful! Application submitted.'
          : isPatientSignupFlow
            ? 'Verification successful! Please sign in.'
            : 'Verification successful!'
      );

      if (isResetFlow && data?.resetToken) {
        const resetRole = isDoctorResetFlow
          ? 'doctor'
          : isClinicResetFlow
            ? 'clinic'
            : isMedicalStoreResetFlow
              ? 'medical-store'
              : 'patient';

        sessionStorage.setItem(
          'resetPasswordContext',
          JSON.stringify({
            email,
            role: resetRole,
            resetToken: data.resetToken
          })
        );
        sessionStorage.removeItem('patientResetContext');
      }

      setTimeout(() => {
        if (isDoctorLoginFlow || isClinicLoginFlow || isMedicalStoreLoginFlow) {
          sessionStorage.removeItem('pendingLogin2fa');

          if (isDoctorLoginFlow) {
            navigate('/doctor/dashboard');
            return;
          }

          if (isClinicLoginFlow) {
            navigate('/clinic/dashboard');
            return;
          }

          navigate('/store/dashboard');
          return;
        }

        if (isDoctorSignupFlow || isClinicSignupFlow || isMedicalStoreSignupFlow) {
          navigate('/');
          return;
        }

        navigate(isPatientSignupFlow ? '/signin' : '/reset-password');
      }, 1200);
    } catch (error) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = otp.length === 6;

  return (
    <div className="w-full flex flex-col items-center px-6 py-10 md:py-20 bg-white min-h-[calc(100vh-250px)]">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-10">
          <h1 className="text-[34px] sm:text-[40px] text-[#6B7280] font-medium tracking-tight mb-3">
            Enter the <span className="text-[#1EBDB8] font-bold">6 digit code</span>
          </h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium leading-relaxed px-4">
            We sent a code to <span className="font-bold text-[#4B5563]">{email || 'your email address'}</span>. To keep your account safe, do not share this code with anyone
          </p>
        </div>

        <form className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-[13.5px] font-bold text-[#6B7280]">Verification Code</label>
            <input 
              type="text" 
              placeholder="0 0 0 0 0 0" 
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[20px] tracking-widest font-medium placeholder:tracking-normal placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
            />
          </div>

          <div className="flex items-center justify-between text-[14px] mt-1 mb-2">
            <span className="text-[#9CA3AF] font-medium">Didn't receive your code?</span>
            <button 
              type="button" 
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className={`font-bold ${countdown > 0 || isResending ? 'text-gray-400 cursor-not-allowed' : 'text-[#1EBDB8] hover:underline underline-offset-4'}`}
            >
              {isResending ? 'Sending...' : countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Code'}
            </button>
          </div>

          <div className="flex flex-col gap-5 mt-2">
            <button 
              type="button" 
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm ${
                isFormValid && !isSubmitting ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Verifying...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
