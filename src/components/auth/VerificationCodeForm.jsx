import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerificationCodeForm() {
  const [method, setMethod] = useState('phone');
  const navigate = useNavigate();

  const isPhone = method === 'phone';

  return (
    <div className="w-full flex flex-col items-center px-6 py-10 md:py-20 bg-white min-h-[calc(100vh-250px)]">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-10">
          <h1 className="text-[34px] sm:text-[40px] text-[#6B7280] font-medium tracking-tight mb-3">
            Enter the <span className="text-[#1EBDB8] font-bold">6 digit code</span>
          </h1>
          <p className="text-[#9CA3AF] text-[14px] font-medium leading-relaxed px-4">
            We sent a code to <span className="font-bold text-[#4B5563]">{isPhone ? "+92 300 1234567" : "your email address"}</span>. To keep your account safe, do not share this code with anyone
          </p>
        </div>

        <form className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-[13.5px] font-bold text-[#6B7280]">Verification Code</label>
            <input 
              type="text" 
              placeholder="_ _ _ _ _ _" 
              maxLength={6}
              className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[20px] tracking-widest font-medium placeholder:tracking-normal placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8]"
            />
          </div>

          <div className="flex items-center justify-between text-[14px] mt-1 mb-2">
            <span className="text-[#9CA3AF] font-medium">Didn't receive your code?</span>
            <button type="button" className="text-[#1EBDB8] font-bold hover:underline underline-offset-4">
              Resend Code
            </button>
          </div>

          <div className="flex flex-col gap-5 mt-2">
            <button 
              type="button" 
              onClick={() => navigate('/reset-password')}
              className="w-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm"
            >
              Continue
            </button>
            <button 
              type="button"
              onClick={() => setMethod(isPhone ? 'email' : 'phone')}
              className="text-[#6B7280] font-bold text-[16px] hover:text-[#4B5563] transition-colors pb-6 border-b-[1.5px] border-gray-200 text-center"
            >
              {isPhone ? "Verify with email instead" : "Verify with phone instead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
