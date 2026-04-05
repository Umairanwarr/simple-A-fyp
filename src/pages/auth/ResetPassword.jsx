import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthNavbar from '../../components/auth/AuthNavbar';
import Footer from '../../components/landingPage/Footer';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState({});

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="font-sans flex flex-col w-full bg-white min-h-screen">
      <AuthNavbar hideControls />
      <div className="w-full flex-grow flex items-center justify-center py-10 px-6 bg-white min-h-[calc(100vh-250px)]">
        <div className="w-full max-w-[500px]">
          <div className="text-center mb-10">
            <h1 className="text-[34px] sm:text-[40px] text-[#6B7280] font-medium tracking-tight mb-2">
              Reset <span className="text-[#1EBDB8] font-bold">Password</span>
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-[22px] sm:text-[26px] font-bold text-[#6B7280] leading-tight">
              Create a new password
            </h2>
            <p className="text-[#9CA3AF] text-[13.5px] sm:text-[14px] font-medium mt-1">
              Enter a new secure password for your account
            </p>
          </div>

          <form className="flex flex-col gap-5">
            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#6B7280]">New Password</label>
              <div className="relative">
                <input
                  type={showPassword['new'] ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword['new'] ? (
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-bold text-[#6B7280]">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword['confirm'] ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className="bg-[#F5F5F5E5] rounded-[10px] px-5 py-4 text-[#4B5563] text-[16px] font-medium placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 transition-all border border-transparent focus:border-[#1EBDB8] w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword['confirm'] ? (
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

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white py-4 rounded-full font-bold text-[16px] transition-colors shadow-sm mt-4"
            >
              Reset Password
            </button>

            {/* Back to Sign In */}
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="text-[#6B7280] font-bold text-[16px] hover:text-[#4B5563] transition-colors text-center mt-2"
            >
              Back to Sign In
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
