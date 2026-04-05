import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function VerificationForm() {
  const [method, setMethod] = useState('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get('flow') === 'signup';

  const isPhone = method === 'phone';
  
  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9+]/g, '');
    setPhone(onlyNums);
  };

  const isFormValid = () => {
    const isContactValid = isPhone 
      ? phone.length >= 10 
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      
    if (isSignup) {
      return isContactValid && termsAccepted;
    }
    return isContactValid;
  };

  return (
    <div className="w-full flex flex-col items-center px-6 py-10 md:py-20 bg-white min-h-[calc(100vh-250px)]">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-10">
          <h1 className="text-[34px] sm:text-[40px] text-[#6B7280] font-medium tracking-tight mb-2">
            Verifying <span className="text-[#1EBDB8] font-bold">Account</span>
          </h1>
        </div>

        <div className="mb-6">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#6B7280] leading-tight text-left">
            {isPhone ? "Enter your mobile phone number" : "Enter your email address"}
          </h2>
          <p className="text-[#9CA3AF] text-[13.5px] sm:text-[14px] font-medium mt-1.5 text-left">
            {isPhone ? "We'll text you to verify your account" : "We'll email you to verify your account"}
          </p>
        </div>

        <form className="flex flex-col gap-6">
          {isPhone ? (
            <input 
              type="tel" 
              placeholder="+92 ( _ _ _ ) _ _ _ - _ _ _ _" 
              value={phone}
              onChange={handlePhoneChange}
              className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full mt-2"
            />
          ) : (
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full mt-2"
            />
          )}

          {isSignup && (
            <label className="flex items-start gap-4 cursor-pointer group mt-2">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-[18px] h-[18px] text-[#1EBDB8] focus:ring-[#1EBDB8] rounded border-gray-300 accent-[#1EBDB8]" 
                />
              </div>
              <p className="text-[13px] text-[#6B7280] font-medium leading-[1.6]">
                I have read and accept Simple's <a href="#" className="font-bold underline decoration-2 underline-offset-2">Terms of Use</a> and I consent to Simple collecting data, including sensitive information such as health data (as fully described in the <a href="#" className="font-bold underline decoration-2 underline-offset-2">Privacy Policy</a>)
              </p>
            </label>
          )}

          <div className="flex flex-col gap-5 mt-4">
            <button 
              type="button" 
              disabled={!isFormValid()}
              onClick={() => navigate('/verification-code')}
              className={`w-full py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm ${
                isFormValid() ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isPhone ? "Send Verification Text" : "Send Verification Email"}
            </button>
            <button 
              type="button" 
              onClick={() => setMethod(isPhone ? 'email' : 'phone')}
              className="text-[#6B7280] font-bold text-[16px] hover:text-[#4B5563] transition-colors pb-6 border-b-[1.5px] border-gray-200"
            >
              {isPhone ? "Verify with email instead" : "Verify with phone instead"}
            </button>
          </div>

          {isSignup && (
            <p className="text-[#9CA3AF] text-[12.5px] font-medium leading-[1.6] text-center px-4 mt-2">
              By clicking "Send verification {isPhone ? "text" : "email"}" you agree to receive account updates and appointment reminders via {isPhone ? "text" : "email"} from Simple. Message frequency varies. Reply STOP to cancel or HELP for help. Message and data rates may apply.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
